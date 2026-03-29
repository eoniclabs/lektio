using Lektio.Api.Models;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class NotebookEndpoints
{
    public static void MapNotebookEndpoints(this WebApplication app)
    {
        app.MapGet("/api/notebook/{profileId}", async (
            string profileId,
            INotebookRepository repo,
            CancellationToken ct) =>
        {
            var entries = await repo.GetByProfileAsync(profileId, ct);
            return Results.Ok(entries);
        });

        app.MapPost("/api/notebook", async (
            CreateNotebookEntryRequest req,
            INotebookRepository repo,
            CancellationToken ct) =>
        {
            var entry = new NotebookEntry
            {
                ProfileId = req.ProfileId,
                Content = req.Content,
                Title = req.Title ?? string.Empty,
                Tags = req.Tags ?? new List<string>()
            };

            var created = await repo.AddAsync(entry, ct);
            return Results.Created($"/api/notebook/{created.Id}", created);
        });

        app.MapDelete("/api/notebook/{id}", async (
            string id,
            INotebookRepository repo,
            CancellationToken ct) =>
        {
            await repo.DeleteAsync(id, ct);
            return Results.NoContent();
        });
    }
}

public record CreateNotebookEntryRequest(
    string ProfileId,
    string Content,
    string? Title,
    List<string>? Tags);
