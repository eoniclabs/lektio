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
        var lastDate = profile.LastActiveDate?.Date;

        // Determine new streak value
        int newStreakDays;
        bool updateStreak;

        if (lastDate is null)
        {
            newStreakDays = 1;
            updateStreak = true;
        }
        else if (lastDate == today)
        {
            // Already active today — only increment TotalMessages
            newStreakDays = profile.StreakDays;
            updateStreak = false;
        }
        else if (lastDate == today.AddDays(-1))
        {
            newStreakDays = profile.StreakDays + 1;
            updateStreak = true;
        }
        else
        {
            newStreakDays = 1;
            updateStreak = true;
        }

        // Atomic update: $inc TotalMessages + conditional $set StreakDays/LastActiveDate
        await _profiles.UpdateStreakAsync(profileId, newStreakDays, updateStreak, DateTime.UtcNow, ct);
    }
}
