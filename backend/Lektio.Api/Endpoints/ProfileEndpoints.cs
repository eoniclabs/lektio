using Lektio.Api.Extensions;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class ProfileEndpoints
{
    public static void MapProfileEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/profiles").RequireAuthorization();

        group.MapGet("/me", async (HttpContext ctx, IProfileRepository profiles, CancellationToken ct) =>
        {
            var profileId = ctx.User.GetProfileId();
            var profile = await profiles.GetByIdAsync(profileId, ct);

            if (profile is null)
                return Results.NotFound();

            return Results.Ok(new
            {
                profile.Id,
                profile.Name,
                profile.Email,
                profile.SchoolLevel,
                profile.Preferences,
                profile.ConceptMastery,
                profile.StreakDays,
                profile.CreatedAt
            });
        });
    }
}
