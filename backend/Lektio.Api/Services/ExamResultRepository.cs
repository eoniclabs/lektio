using Lektio.Api.Infrastructure;
using Lektio.Api.Models;
using MongoDB.Driver;

namespace Lektio.Api.Services;

public class ExamResultRepository : IExamResultRepository
{
    private readonly IMongoCollection<ExamResult> _collection;

    public ExamResultRepository(MongoDbContext db)
    {
        _collection = db.GetCollection<ExamResult>("exam_results");
    }

    public async Task<ExamResult> SaveAsync(ExamResult result, CancellationToken ct)
    {
        await _collection.InsertOneAsync(result, cancellationToken: ct);
        return result;
    }

    public async Task<List<ExamResult>> GetByProfileAsync(string profileId, CancellationToken ct)
    {
        return await _collection
            .Find(r => r.ProfileId == profileId)
            .SortByDescending(r => r.CompletedAt)
            .ToListAsync(ct);
    }
}
