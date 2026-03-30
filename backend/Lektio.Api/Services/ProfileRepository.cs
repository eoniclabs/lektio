using Lektio.Api.Infrastructure;
using Lektio.Api.Models;
using MongoDB.Driver;
using MongoDB.Driver.Linq;



namespace Lektio.Api.Services;

public class ProfileRepository : IProfileRepository
{
    private readonly IMongoCollection<StudentProfile> _collection;

    public ProfileRepository(MongoDbContext db)
    {
        _collection = db.GetCollection<StudentProfile>("profiles");
    }

    public async Task<StudentProfile> CreateAsync(StudentProfile profile)
    {
        profile.CreatedAt = DateTime.UtcNow;
        profile.UpdatedAt = DateTime.UtcNow;
        await _collection.InsertOneAsync(profile);
        return profile;
    }

    public async Task<StudentProfile?> GetByIdAsync(string id)
    {
        return await _collection.Find(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task<StudentProfile?> UpdateAsync(string id, StudentProfile updated)
    {
        // Preserve CreatedAt from the existing document to avoid overwriting it
        var existing = await _collection.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (existing is null) return null;

        updated.Id = id;
        updated.CreatedAt = existing.CreatedAt;
        updated.UpdatedAt = DateTime.UtcNow;
        await _collection.ReplaceOneAsync(p => p.Id == id, updated);
        return updated;
    }

    public async Task UpdateStreakAsync(string profileId, int newStreakDays, bool updateStreak, DateTime lastActiveDate, CancellationToken ct)
    {
        var update = Builders<StudentProfile>.Update
            .Inc(p => p.TotalMessages, 1)
            .Set(p => p.LastActiveDate, lastActiveDate);

        if (updateStreak)
            update = update.Set(p => p.StreakDays, newStreakDays);

        await _collection.UpdateOneAsync(p => p.Id == profileId, update, cancellationToken: ct);
    }

    public async Task UpsertConceptMasteriesAsync(string profileId, IEnumerable<string> concepts, CancellationToken ct)
    {
        var profile = await _collection.Find(p => p.Id == profileId).FirstOrDefaultAsync(ct);
        if (profile is null) return;

        var now = DateTime.UtcNow;
        foreach (var concept in concepts)
        {
            var normalised = concept.Trim().ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(normalised)) continue;

            var existing = profile.ConceptMasteries
                .FirstOrDefault(c => c.Concept.Equals(normalised, StringComparison.OrdinalIgnoreCase));

            if (existing is null)
            {
                profile.ConceptMasteries.Add(new ConceptMastery
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

        profile.UpdatedAt = now;
        await _collection.ReplaceOneAsync(p => p.Id == profileId, profile, cancellationToken: ct);
    }
}
