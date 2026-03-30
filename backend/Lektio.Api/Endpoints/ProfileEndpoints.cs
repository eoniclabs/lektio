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

            return Results.Ok(new ProfileStatsResponse(
                profile.StreakDays,
                profile.TotalMessages,
                profile.ConceptMasteries));
        });

        app.MapGet("/api/profiles/{id}/concepts", async (string id, IProfileRepository repo) =>
        {
            var profile = await repo.GetByIdAsync(id);
            if (profile is null) return Results.NotFound();

            var concepts = profile.ConceptMasteries
                .OrderByDescending(c => c.Level)
                .ThenByDescending(c => c.LastSeenAt)
                .ToList();

            return Results.Ok(new ConceptMasteriesResponse(concepts));
        });
    }
}

public record ProfileStatsResponse(
    int StreakDays,
    int TotalMessages,
    List<Lektio.Api.Models.ConceptMastery> ConceptMasteries);

public record ConceptMasteriesResponse(List<Lektio.Api.Models.ConceptMastery> Concepts);
