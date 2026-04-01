using Lektio.Api.Models;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/auth").AllowAnonymous();

        group.MapPost("/register", async (
            RegisterRequest req,
            IProfileRepository profiles,
            JwtService jwt) =>
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return Results.BadRequest(new { error = "E-postadress krävs" });

            if (string.IsNullOrWhiteSpace(req.Password) || req.Password.Length < 6)
                return Results.BadRequest(new { error = "Lösenord måste vara minst 6 tecken" });

            var existing = await profiles.GetByEmailAsync(req.Email.Trim().ToLowerInvariant());
            if (existing is not null)
                return Results.Conflict(new { error = "E-postadressen används redan" });

            var profile = new StudentProfile
            {
                Email = req.Email.Trim().ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Name = req.Name,
                SchoolLevel = req.SchoolLevel,
                Preferences = req.Preferences ?? new StudentPreferences()
            };

            await profiles.CreateAsync(profile);

            var token = jwt.GenerateToken(profile.Id, profile.Email);
            return Results.Ok(new AuthResponse(token, profile.Id, profile.Name));
        });

        group.MapPost("/login", async (
            LoginRequest req,
            IProfileRepository profiles,
            JwtService jwt) =>
        {
            if (string.IsNullOrWhiteSpace(req.Email) || string.IsNullOrWhiteSpace(req.Password))
                return Results.BadRequest(new { error = "E-post och lösenord krävs" });

            var profile = await profiles.GetByEmailAsync(req.Email.Trim().ToLowerInvariant());
            if (profile is null || !BCrypt.Net.BCrypt.Verify(req.Password, profile.PasswordHash))
                return Results.Unauthorized();

            var token = jwt.GenerateToken(profile.Id, profile.Email);
            return Results.Ok(new AuthResponse(token, profile.Id, profile.Name));
        });
    }
}
