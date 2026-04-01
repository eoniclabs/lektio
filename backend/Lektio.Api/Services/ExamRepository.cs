using Lektio.Api.Infrastructure;
using Lektio.Api.Models;
using MongoDB.Driver;

namespace Lektio.Api.Services;

public class ExamRepository : IExamRepository
{
    private readonly IMongoCollection<Exam> _collection;

    public ExamRepository(MongoDbContext db)
    {
        _collection = db.GetCollection<Exam>("exams");
    }

    public async Task<Exam> SaveAsync(Exam exam, CancellationToken ct)
    {
        await _collection.InsertOneAsync(exam, cancellationToken: ct);
        return exam;
    }

    public async Task<Exam?> GetByIdAsync(string id, CancellationToken ct)
    {
        return await _collection
            .Find(e => e.Id == id)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<List<Exam>> GetByProfileAsync(string profileId, CancellationToken ct)
    {
        return await _collection
            .Find(e => e.ProfileId == profileId)
            .SortByDescending(e => e.CreatedAt)
            .ToListAsync(ct);
    }
}
