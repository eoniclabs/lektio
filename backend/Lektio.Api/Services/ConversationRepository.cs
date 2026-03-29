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

        // Ensure index on ProfileId for fast per-profile lookups
        var indexModel = new CreateIndexModel<Conversation>(
            Builders<Conversation>.IndexKeys.Ascending(c => c.ProfileId));
        _collection.Indexes.CreateOne(indexModel);
    }

    public async Task<Conversation> GetOrCreateForProfileAsync(string profileId)
    {
        // Atomic upsert – avoids TOCTOU race between Find and Insert
        var now = DateTime.UtcNow;
        var filter = Builders<Conversation>.Filter.Eq(c => c.ProfileId, profileId);
        var update = Builders<Conversation>.Update
            .SetOnInsert(c => c.ProfileId, profileId)
            .SetOnInsert(c => c.Messages, new List<ConversationMessage>())
            .SetOnInsert(c => c.CreatedAt, now)
            .Set(c => c.UpdatedAt, now);
        var options = new FindOneAndUpdateOptions<Conversation>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After,
            Sort = Builders<Conversation>.Sort.Descending(c => c.UpdatedAt)
        };

        return await _collection.FindOneAndUpdateAsync(filter, update, options);
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
