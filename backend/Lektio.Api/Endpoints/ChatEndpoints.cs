using Lektio.Api.Extensions;
using Lektio.Api.Models;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class ChatEndpoints
{
    public static void MapChatEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/chat").RequireAuthorization();

        group.MapPost("/message", async (
            ChatRequest req,
            HttpContext ctx,
            IConversationRepository conversations,
            CancellationToken ct) =>
        {
            var profileId = ctx.User.GetProfileId();
            string conversationId;

            if (string.IsNullOrEmpty(req.ConversationId))
            {
                // Create new conversation with title from first message
                var title = req.Message.Length > 50
                    ? req.Message[..50] + "..."
                    : req.Message;
                var conversation = await conversations.CreateAsync(profileId, title, ct);
                conversationId = conversation.Id;
            }
            else
            {
                conversationId = req.ConversationId;

                // Verify ownership
                var conversation = await conversations.GetByIdAsync(conversationId, ct);
                if (conversation is null || conversation.ProfileId != profileId)
                    return Results.NotFound();
            }

            // Append user message
            await conversations.AppendMessageAsync(conversationId, new ConversationMessage
            {
                Role = "user",
                Content = req.Message,
                ImageUrl = req.ImageUrl,
                Timestamp = DateTime.UtcNow
            }, ct);

            // Return conversation ID so frontend can track it
            return Results.Ok(new ChatResponse(conversationId));
        });
    }

    private record ChatRequest(string Message, string? ConversationId, string? ImageUrl);
    private record ChatResponse(string ConversationId);
}
