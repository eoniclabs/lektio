using Lektio.Api.Extensions;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class ConversationEndpoints
{
    public static void MapConversationEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/conversations").RequireAuthorization();

        group.MapGet("/", async (HttpContext ctx, IConversationRepository conversations, CancellationToken ct) =>
        {
            var profileId = ctx.User.GetProfileId();
            var list = await conversations.GetByProfileAsync(profileId, ct);
            return Results.Ok(list);
        });

        group.MapGet("/{id}", async (string id, HttpContext ctx, IConversationRepository conversations, CancellationToken ct) =>
        {
            var profileId = ctx.User.GetProfileId();
            var conversation = await conversations.GetByIdAsync(id, ct);

            if (conversation is null || conversation.ProfileId != profileId)
                return Results.NotFound();

            return Results.Ok(conversation);
        });

        group.MapPatch("/{id}/title", async (string id, RenameRequest req, HttpContext ctx, IConversationRepository conversations, CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(req.Title))
                return Results.BadRequest(new { error = "Titel krävs" });

            var profileId = ctx.User.GetProfileId();
            await conversations.RenameAsync(id, profileId, req.Title, ct);
            return Results.Ok();
        });

        group.MapDelete("/{id}", async (string id, HttpContext ctx, IConversationRepository conversations, CancellationToken ct) =>
        {
            var profileId = ctx.User.GetProfileId();
            await conversations.DeleteAsync(id, profileId, ct);
            return Results.Ok();
        });
    }

    private record RenameRequest(string Title);
}
