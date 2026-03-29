using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IProfileRepository
{
    Task<StudentProfile> CreateAsync(StudentProfile profile);
    Task<StudentProfile?> GetByIdAsync(string id);
    Task<StudentProfile?> UpdateAsync(string id, StudentProfile profile);
}
