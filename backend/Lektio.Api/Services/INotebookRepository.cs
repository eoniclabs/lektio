using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface INotebookRepository
{
    Task<List<NotebookEntry>> GetByProfileAsync(string profileId, CancellationToken ct);
    Task<NotebookEntry> AddAsync(NotebookEntry entry, CancellationToken ct);
    Task DeleteAsync(string id, string profileId, CancellationToken ct);
}
