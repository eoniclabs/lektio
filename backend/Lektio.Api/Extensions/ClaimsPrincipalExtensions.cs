using System.Security.Claims;

namespace Lektio.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetProfileId(this ClaimsPrincipal user)
        => user.FindFirst(ClaimTypes.NameIdentifier)?.Value
           ?? throw new UnauthorizedAccessException("Missing profile ID in token");
}
