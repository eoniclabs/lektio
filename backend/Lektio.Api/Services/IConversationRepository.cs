using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IConversationRepository
{
    Task<Conversation> CreateAsync(string profileId, string title, CancellationToken ct = default);
    Task<Conversation?> GetByIdAsync(string id, CancellationToken ct = default);
    Task<List<ConversationSummary>> GetByProfileAsync(string profileId, CancellationToken ct = default);
    Task AppendMessageAsync(string id, ConversationMessage message, CancellationToken ct = default);
    Task RenameAsync(string id, string profileId, string title, CancellationToken ct = default);
    Task DeleteAsync(string id, string profileId, CancellationToken ct = default);
}
