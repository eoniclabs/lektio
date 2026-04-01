using System.Text;
using System.Text.Json;
using Lektio.Api.Extensions;
using Lektio.Api.Models;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class ChatEndpoints
{
    // Non-static marker used as the category type for ILogger<T>
    // (static classes cannot be used as generic type arguments in C#)
    private sealed class ChatHandler;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public static void MapChatEndpoints(this WebApplication app)
    {
        app.MapPost("/api/chat", HandleChatAsync).RequireAuthorization();
    }

    private static async Task HandleChatAsync(
        ChatRequest req,
        IAiService ai,
        IConversationRepository conversations,
        IProfileRepository profiles,
        IStreakService streakService,
        IServiceScopeFactory scopeFactory,
        HttpContext ctx,
        ILogger<ChatHandler> logger,
        CancellationToken ct)
    {
        // Validate message is not empty (Gemini requires non-empty content)
        if (string.IsNullOrWhiteSpace(req.Message) && string.IsNullOrWhiteSpace(req.ImageContext))
        {
            ctx.Response.StatusCode = 400;
            await ctx.Response.WriteAsync("Message cannot be empty", ct);
            return;
        }

        // Extract profileId from JWT instead of request body
        var profileId = ctx.User.GetProfileId();

        var profile = await profiles.GetByIdAsync(profileId, ct);
        if (profile is null)
        {
            ctx.Response.StatusCode = 404;
            await ctx.Response.WriteAsync("Profile not found", ct);
            return;
        }

        // Set up SSE headers
        ctx.Response.ContentType = "text/event-stream";
        ctx.Response.Headers.CacheControl = "no-cache";
        ctx.Response.Headers.Connection = "keep-alive";
        ctx.Response.Headers["X-Accel-Buffering"] = "no";

        await ctx.Response.StartAsync(ct);

        // Load or create conversation -- verify ownership to prevent cross-user injection
        Conversation conversation;
        if (!string.IsNullOrEmpty(req.ConversationId))
        {
            var requested = await conversations.GetByIdAsync(req.ConversationId, ct);
            conversation = (requested is not null && requested.ProfileId == profileId)
                ? requested
                : await conversations.GetOrCreateForProfileAsync(profileId);
        }
        else
        {
            // Create new conversation with title from first user message
            var title = (req.Message?.Length ?? 0) > 50
                ? req.Message![..50] + "..."
                : req.Message ?? "Ny chatt";
            conversation = await conversations.CreateAsync(profileId, title, ct);
        }

        // Build history for Claude (last 20 messages)
        var history = conversation.Messages.TakeLast(20).ToList();

        // Accumulate full response text
        var fullText = new StringBuilder();

        try
        {
            await ai.StreamChatAsync(
                profile,
                history,
                req.Message ?? "",
                req.ImageContext,
                async token =>
                {
                    fullText.Append(token);
                    var deltaEvent = new SseEvent { Type = "delta", Token = token };
                    await WriteSseAsync(ctx.Response, deltaEvent, ct);
                },
                ct);

            // Parse structured response -- handle JSON, markdown-fenced JSON, or plain text
            var rawText = fullText.ToString().Trim();
            var chatResponse = ParseChatResponse(rawText, conversation.Id, logger);

            chatResponse.ConversationId = conversation.Id;

            // Persist messages to conversation
            await conversations.AppendMessagesAsync(
                conversation.Id,
                new ConversationMessage { Role = "user", Content = req.Message ?? "" },
                new ConversationMessage { Role = "assistant", Content = chatResponse.Text });

            // Update streak
            await streakService.UpdateStreakAsync(profileId, ct);

            // Fire-and-forget concept extraction in a new DI scope (non-blocking)
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    var conceptService = scope.ServiceProvider.GetRequiredService<IConceptService>();
                    await conceptService.ExtractAndUpdateAsync(profileId, chatResponse.Text, CancellationToken.None);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Background concept extraction failed for profile {ProfileId}", profileId);
                }
            }, CancellationToken.None);

            // Send done event
            var doneEvent = new SseEvent { Type = "done", Response = chatResponse };
            await WriteSseAsync(ctx.Response, doneEvent, ct);
        }
        catch (OperationCanceledException)
        {
            // Client disconnected -- that's fine
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during chat streaming");
            var errorEvent = new SseEvent { Type = "error", Error = "Ett fel uppstod. Försök igen." };
            await WriteSseAsync(ctx.Response, errorEvent, ct);
        }

        await ctx.Response.Body.FlushAsync(ct);
    }

    private static ChatResponse ParseChatResponse(string rawText, string conversationId, ILogger logger)
    {
        var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        // Strategy 1: Try parsing the whole response as JSON
        var cleaned = rawText;

        // Strip markdown code fences if present
        if (cleaned.StartsWith("```"))
        {
            var start = cleaned.IndexOf('\n') + 1;
            var end = cleaned.LastIndexOf("```");
            if (end > start)
                cleaned = cleaned[start..end].Trim();
        }

        try
        {
            var parsed = JsonSerializer.Deserialize<ChatResponse>(cleaned, jsonOptions);
            if (parsed?.Text is not null)
            {
                parsed.ConversationId = conversationId;
                return parsed;
            }
        }
        catch (JsonException) { /* continue to next strategy */ }

        // Strategy 2: Extract JSON object from mixed text (AI may prefix/suffix text around JSON)
        var jsonStart = rawText.IndexOf('{');
        var jsonEnd = rawText.LastIndexOf('}');
        if (jsonStart >= 0 && jsonEnd > jsonStart)
        {
            var candidate = rawText[jsonStart..(jsonEnd + 1)];
            try
            {
                var parsed = JsonSerializer.Deserialize<ChatResponse>(candidate, jsonOptions);
                if (parsed?.Text is not null)
                {
                    parsed.ConversationId = conversationId;
                    return parsed;
                }
            }
            catch (JsonException) { /* continue to fallback */ }
        }

        // Strategy 3: Fallback -- treat entire response as plain markdown text
        logger.LogWarning("AI returned non-JSON response, wrapping as plain text.");
        return new ChatResponse
        {
            Text = rawText,
            Narration = null,
            VisualPrimitives = [],
            ConversationId = conversationId
        };
    }

    private static async Task WriteSseAsync(HttpResponse response, SseEvent evt, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(evt, JsonOptions);
        await response.WriteAsync($"data: {json}\n\n", ct);
        await response.Body.FlushAsync(ct);
    }
}
