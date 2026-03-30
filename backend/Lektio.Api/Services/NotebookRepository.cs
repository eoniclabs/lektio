using Lektio.Api.Infrastructure;
using Lektio.Api.Models;
using MongoDB.Driver;

namespace Lektio.Api.Services;

public class NotebookRepository : INotebookRepository
{
    private readonly IMongoCollection<NotebookEntry> _collection;

    public NotebookRepository(MongoDbContext db)
    {
        _collection = db.GetCollection<NotebookEntry>("notebook_entries");
    }

    public async Task<List<NotebookEntry>> GetByProfileAsync(string profileId, CancellationToken ct)
    {
        return await _collection
            .Find(e => e.ProfileId == profileId)
            .SortByDescending(e => e.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<NotebookEntry> AddAsync(NotebookEntry entry, CancellationToken ct)
    {
        entry.CreatedAt = DateTime.UtcNow;
        await _collection.InsertOneAsync(entry, cancellationToken: ct);
        return entry;
    }

    public async Task DeleteAsync(string id, string profileId, CancellationToken ct)
    {
        await _collection.DeleteOneAsync(e => e.Id == id && e.ProfileId == profileId, ct);
    }
}
