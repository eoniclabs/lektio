using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IProfileRepository
{
    Task<StudentProfile> CreateAsync(StudentProfile profile, CancellationToken ct = default);
    Task<StudentProfile?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<StudentProfile?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<StudentProfile> UpdateAsync(StudentProfile profile, CancellationToken ct = default);
}
