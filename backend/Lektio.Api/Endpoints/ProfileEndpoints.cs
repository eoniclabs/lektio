using Lektio.Api.Models;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class ProfileEndpoints
{
    public static void MapProfileEndpoints(this WebApplication app)
    {
        app.MapPost("/api/profiles", async (StudentProfile profile, IProfileRepository repo) =>
        {
            var created = await repo.CreateAsync(profile);
            return Results.Created($"/api/profiles/{created.Id}", created);
        });

        app.MapGet("/api/profiles/{id}", async (string id, IProfileRepository repo) =>
        {
            var profile = await repo.GetByIdAsync(id);
            return profile is null ? Results.NotFound() : Results.Ok(profile);
        });

        app.MapPut("/api/profiles/{id}", async (string id, StudentProfile profile, IProfileRepository repo) =>
        {
            profile.Id = id;
            var updated = await repo.UpdateAsync(id, profile);
            return updated is null ? Results.NotFound() : Results.Ok(updated);
        });

        app.MapGet("/api/profiles/{id}/stats", async (string id, IProfileRepository repo) =>
        {
            var profile = await repo.GetByIdAsync(id);
            if (profile is null) return Results.NotFound();

            var stats = new
            {
                streakDays = profile.StreakDays,
                totalMessages = profile.TotalMessages,
                conceptMasteries = profile.ConceptMasteries
            };

            return Results.Ok(stats);
        });
    }
}
