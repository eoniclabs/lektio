using System.Security.Claims;

namespace Lektio.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Extracts the profile ID from the JWT NameIdentifier claim.
    /// Throws if missing -- but endpoints using this are protected by RequireAuthorization(),
    /// so the JWT middleware rejects unauthenticated requests before this executes.
    /// </summary>
    public static string GetProfileId(this ClaimsPrincipal user)
        => user.FindFirst(ClaimTypes.NameIdentifier)?.Value
           ?? throw new UnauthorizedAccessException("Missing profile ID in token");
}
