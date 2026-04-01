using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IExamRepository
{
    Task<Exam> SaveAsync(Exam exam, CancellationToken ct);
    Task<Exam?> GetByIdAsync(string id, CancellationToken ct);
    Task<List<Exam>> GetByProfileAsync(string profileId, CancellationToken ct);
}
