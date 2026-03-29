using Lektio.Api.Infrastructure;
using Lektio.Api.Models;
using MongoDB.Driver;

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
}
