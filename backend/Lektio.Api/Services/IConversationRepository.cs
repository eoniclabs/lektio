using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IConversationRepository
{
    Task<Conversation> GetOrCreateForProfileAsync(string profileId);
    Task<Conversation?> GetByIdAsync(string id);
    Task AppendMessagesAsync(string conversationId, ConversationMessage user, ConversationMessage assistant);
}
