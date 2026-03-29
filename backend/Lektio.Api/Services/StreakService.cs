namespace Lektio.Api.Services;

public class StreakService : IStreakService
{
    private readonly IProfileRepository _profiles;

    public StreakService(IProfileRepository profiles)
    {
        _profiles = profiles;
    }

    public async Task UpdateStreakAsync(string profileId, CancellationToken ct)
    {
        var profile = await _profiles.GetByIdAsync(profileId);
        if (profile is null) return;

        var today = DateTime.UtcNow.Date;

        if (profile.LastActiveDate is null)
        {
            profile.StreakDays = 1;
        }
        else
        {
            var lastDate = profile.LastActiveDate.Value.Date;
            if (lastDate == today)
            {
                // Already active today – just increment messages
            }
            else if (lastDate == today.AddDays(-1))
            {
                profile.StreakDays += 1;
            }
            else
            {
                profile.StreakDays = 1;
            }
        }

        profile.LastActiveDate = DateTime.UtcNow;
        profile.TotalMessages += 1;

        await _profiles.UpdateAsync(profileId, profile);
    }
}
