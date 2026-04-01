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

        // Create unique sparse index on Email (only indexes documents where Email is non-empty)
        var indexKeys = Builders<StudentProfile>.IndexKeys.Ascending(p => p.Email);
        var indexOptions = new CreateIndexOptions
        {
            Unique = true,
            Sparse = true,
            Name = "email_unique_sparse"
        };
        _profiles.Indexes.CreateOne(new CreateIndexModel<StudentProfile>(indexKeys, indexOptions));
    }

    public async Task<StudentProfile> CreateAsync(StudentProfile profile, CancellationToken ct)
    {
        profile.CreatedAt = DateTime.UtcNow;
        profile.UpdatedAt = DateTime.UtcNow;
        await _profiles.InsertOneAsync(profile, cancellationToken: ct);
        return profile;
    }

    public async Task<StudentProfile?> GetByIdAsync(string id, CancellationToken ct)
    {
        return await _profiles.Find(p => p.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<StudentProfile?> GetByEmailAsync(string email, CancellationToken ct)
    {
        return await _profiles.Find(p => p.Email == email).FirstOrDefaultAsync(ct);
    }

    public async Task<StudentProfile> UpdateAsync(StudentProfile profile, CancellationToken ct)
    {
        profile.UpdatedAt = DateTime.UtcNow;
        await _profiles.ReplaceOneAsync(p => p.Id == profile.Id, profile, cancellationToken: ct);
        return profile;
    }
}
