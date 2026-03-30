using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IProfileRepository
{
    Task<StudentProfile> CreateAsync(StudentProfile profile);
    Task<StudentProfile?> GetByIdAsync(string id);
    Task<StudentProfile?> UpdateAsync(string id, StudentProfile profile);
    Task UpdateStreakAsync(string profileId, int newStreakDays, bool updateStreak, DateTime lastActiveDate, CancellationToken ct);

    /// <summary>
    /// For each concept name, increment its mastery level by 1 (max 5).
    /// If the concept does not exist yet it is added with level 1.
    /// </summary>
    Task UpsertConceptMasteriesAsync(string profileId, IEnumerable<string> concepts, CancellationToken ct);
}
