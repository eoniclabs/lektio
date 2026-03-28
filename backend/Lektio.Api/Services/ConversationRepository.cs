using Lektio.Api.Infrastructure;
using Lektio.Api.Models;
using MongoDB.Driver;

namespace Lektio.Api.Services;

public class ConversationRepository : IConversationRepository
{
    private readonly IMongoCollection<Conversation> _collection;

    public ConversationRepository(MongoDbContext db)
    {
        _collection = db.GetCollection<Conversation>("conversations");
    }

    public async Task<Conversation> GetOrCreateForProfileAsync(string profileId)
    {
        var existing = await _collection
            .Find(c => c.ProfileId == profileId)
            .SortByDescending(c => c.UpdatedAt)
            .FirstOrDefaultAsync();

        if (existing is not null)
            return existing;

        var conversation = new Conversation
        {
            ProfileId = profileId,
            Messages = [],
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _collection.InsertOneAsync(conversation);
        return conversation;
    }

    public async Task<Conversation?> GetByIdAsync(string id)
    {
        return await _collection.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task AppendMessagesAsync(string conversationId, ConversationMessage user, ConversationMessage assistant)
    {
        var update = Builders<Conversation>.Update
            .PushEach(c => c.Messages, [user, assistant])
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        await _collection.UpdateOneAsync(c => c.Id == conversationId, update);
    }
}
