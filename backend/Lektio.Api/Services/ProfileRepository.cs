using Lektio.Api.Infrastructure;
using Lektio.Api.Models;
using MongoDB.Driver;

namespace Lektio.Api.Services;

public class ProfileRepository : IProfileRepository
{
    private readonly IMongoCollection<StudentProfile> _profiles;

    public ProfileRepository(MongoDbContext db)
    {
        _profiles = db.GetCollection<StudentProfile>("profiles");

        // Create unique index on Email, only for non-empty values.
        // Atlas partial indexes support $exists/$gt/$gte/$lt/$lte/$type only (not $ne).
        var indexKeys = Builders<StudentProfile>.IndexKeys.Ascending(p => p.Email);
        var indexOptions = new CreateIndexOptions<StudentProfile>
        {
            Unique = true,
            Name = "email_unique_gt",
            PartialFilterExpression = Builders<StudentProfile>.Filter.Gt(p => p.Email, "")
        };
        _profiles.Indexes.CreateOne(new CreateIndexModel<StudentProfile>(indexKeys, indexOptions));
    }

    public async Task<StudentProfile> CreateAsync(StudentProfile profile, CancellationToken ct = default)
    {
        profile.CreatedAt = DateTime.UtcNow;
        profile.UpdatedAt = DateTime.UtcNow;
        await _profiles.InsertOneAsync(profile, cancellationToken: ct);
        return profile;
    }

    public async Task<StudentProfile?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        return await _profiles.Find(p => p.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<StudentProfile?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        return await _profiles.Find(p => p.Email == email).FirstOrDefaultAsync(ct);
    }

    // TODO: Consider using $set for individual fields instead of ReplaceOneAsync
    // to avoid overwriting concurrent updates from UpdateStreakAsync / UpsertConceptMasteriesAsync.
    public async Task<StudentProfile> UpdateAsync(StudentProfile profile, CancellationToken ct = default)
    {
        profile.UpdatedAt = DateTime.UtcNow;
        await _profiles.ReplaceOneAsync(p => p.Id == profile.Id, profile, cancellationToken: ct);
        return profile;
    }

    public async Task UpdateStreakAsync(string profileId, int newStreakDays, bool updateStreak, DateTime lastActiveDate, CancellationToken ct)
    {
        var update = Builders<StudentProfile>.Update
            .Inc(p => p.TotalMessages, 1)
            .Set(p => p.LastActiveDate, lastActiveDate);

        if (updateStreak)
            update = update.Set(p => p.StreakDays, newStreakDays);

        await _profiles.UpdateOneAsync(p => p.Id == profileId, update, cancellationToken: ct);
    }

    public async Task UpsertConceptMasteriesAsync(string profileId, IEnumerable<string> concepts, CancellationToken ct)
    {
        var profile = await _profiles.Find(p => p.Id == profileId).FirstOrDefaultAsync(ct);
        if (profile is null) return;

        var now = DateTime.UtcNow;
        var masteries = profile.ConceptMasteries ??= [];

        foreach (var concept in concepts)
        {
            var normalised = concept.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(normalised)) continue;

            var existing = masteries
                .FirstOrDefault(c => c.Concept.Equals(normalised, StringComparison.OrdinalIgnoreCase));

            if (existing is null)
            {
                masteries.Add(new ConceptMastery
                {
                    Concept = normalised,
                    Level = 1,
                    LastSeenAt = now
                });
            }
            else
            {
                existing.Level = Math.Min(existing.Level + 1, 5);
                existing.LastSeenAt = now;
            }
        }

        var update = Builders<StudentProfile>.Update
            .Set(p => p.ConceptMasteries, masteries)
            .Set(p => p.UpdatedAt, now);
        await _profiles.UpdateOneAsync(p => p.Id == profileId, update, cancellationToken: ct);
    }
}
