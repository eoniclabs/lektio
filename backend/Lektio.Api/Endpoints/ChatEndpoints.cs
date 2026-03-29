using System.Text;
using System.Text.Json;
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
        app.MapPost("/api/chat", HandleChatAsync);
    }

    private static async Task HandleChatAsync(
        ChatRequest req,
        IClaudeService claude,
        IConversationRepository conversations,
        IProfileRepository profiles,
        HttpContext ctx,
        ILogger<ChatHandler> logger,
        CancellationToken ct)
    {
        var profile = await profiles.GetByIdAsync(req.ProfileId);
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

        // Load or create conversation – verify ownership to prevent cross-user injection
        Conversation conversation;
        if (!string.IsNullOrEmpty(req.ConversationId))
        {
            var requested = await conversations.GetByIdAsync(req.ConversationId);
            conversation = (requested is not null && requested.ProfileId == req.ProfileId)
                ? requested
                : await conversations.GetOrCreateForProfileAsync(req.ProfileId);
        }
        else
        {
            conversation = await conversations.GetOrCreateForProfileAsync(req.ProfileId);
        }

        // Build history for Claude (last 20 messages)
        var history = conversation.Messages.TakeLast(20).ToList();

        // Accumulate full response text
        var fullText = new StringBuilder();

        try
        {
            await claude.StreamChatAsync(
                profile,
                history,
                req.Message,
                req.ImageContext,
                async token =>
                {
                    fullText.Append(token);
                    var deltaEvent = new SseEvent { Type = "delta", Token = token };
                    await WriteSseAsync(ctx.Response, deltaEvent, ct);
                },
                ct);

            // Parse structured response
            var rawText = fullText.ToString().Trim();
            ChatResponse chatResponse;
            try
            {
                // Strip markdown code fences if Claude wrapped the JSON
                if (rawText.StartsWith("```"))
                {
                    var start = rawText.IndexOf('\n') + 1;
                    var end = rawText.LastIndexOf("```");
                    rawText = end > start ? rawText[start..end].Trim() : rawText;
                }

                var parsed = JsonSerializer.Deserialize<ChatResponse>(rawText, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                chatResponse = parsed ?? new ChatResponse
                {
                    Text = rawText,
                    ConversationId = conversation.Id
                };
            }
            catch (JsonException)
            {
                logger.LogWarning("Claude returned non-JSON, wrapping as plain text.");
                chatResponse = new ChatResponse
                {
                    Text = rawText,
                    ConversationId = conversation.Id
                };
            }

            chatResponse.ConversationId = conversation.Id;

            // Persist messages to conversation
            await conversations.AppendMessagesAsync(
                conversation.Id,
                new ConversationMessage { Role = "user", Content = req.Message },
                new ConversationMessage { Role = "assistant", Content = chatResponse.Text });

            // Send done event
            var doneEvent = new SseEvent { Type = "done", Response = chatResponse };
            await WriteSseAsync(ctx.Response, doneEvent, ct);
        }
        catch (OperationCanceledException)
        {
            // Client disconnected – that's fine
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during chat streaming");
            var errorEvent = new SseEvent { Type = "error", Error = "Ett fel uppstod. Försök igen." };
            await WriteSseAsync(ctx.Response, errorEvent, ct);
        }

        await ctx.Response.Body.FlushAsync(ct);
    }

    private static async Task WriteSseAsync(HttpResponse response, SseEvent evt, CancellationToken ct)
    {
        var json = JsonSerializer.Serialize(evt, JsonOptions);
        await response.WriteAsync($"data: {json}\n\n", ct);
        await response.Body.FlushAsync(ct);
    }
}
