using Lektio.Api.Models;
using Lektio.Api.Services;
using Microsoft.AspNetCore.Mvc;

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
            if (string.IsNullOrWhiteSpace(req.ProfileId) || string.IsNullOrWhiteSpace(req.Content))
                return Results.BadRequest("ProfileId and Content are required.");

            var entry = new NotebookEntry
            {
                ProfileId = req.ProfileId,
                Content = req.Content,
                Title = req.Title ?? string.Empty,
                Tags = req.Tags ?? []
            };

            var created = await repo.AddAsync(entry, ct);
            return Results.Created($"/api/notebook/{created.Id}", created);
        });

        app.MapDelete("/api/notebook/{id}", async (
            string id,
            [FromQuery] string profileId,
            INotebookRepository repo,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(profileId))
                return Results.BadRequest("profileId is required.");

            await repo.DeleteAsync(id, profileId, ct);
            return Results.NoContent();
        });
    }
}

public record CreateNotebookEntryRequest(
    string ProfileId,
    string Content,
    string? Title,
    List<string>? Tags);
