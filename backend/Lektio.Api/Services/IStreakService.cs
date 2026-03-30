namespace Lektio.Api.Services;

public interface IStreakService
{
    Task UpdateStreakAsync(string profileId, CancellationToken ct);
}
