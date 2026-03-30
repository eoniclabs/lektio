using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IExamService
{
    Task<Exam> GenerateAsync(string profileId, string topic, int questionCount, CancellationToken ct);
}
