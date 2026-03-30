using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IExamResultRepository
{
    Task<ExamResult> SaveAsync(ExamResult result, CancellationToken ct);
    Task<List<ExamResult>> GetByProfileAsync(string profileId, CancellationToken ct);
}
