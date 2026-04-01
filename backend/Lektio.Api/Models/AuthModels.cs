namespace Lektio.Api.Models;

public record RegisterRequest(
    string Email,
    string Password,
    string Name,
    string SchoolLevel,
    StudentPreferences Preferences);

public record LoginRequest(string Email, string Password);

public record AuthResponse(string Token, string ProfileId, string Name);
