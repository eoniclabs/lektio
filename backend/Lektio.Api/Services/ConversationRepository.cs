using Lektio.Api.Infrastructure;
using Lektio.Api.Models;
using MongoDB.Driver;

namespace Lektio.Api.Services;

public class ConversationRepository : IConversationRepository
{
    private readonly IMongoCollection<Conversation> _conversations;

    public ConversationRepository(MongoDbContext db)
    {
        _conversations = db.GetCollection<Conversation>("conversations");

        var indexKeys = Builders<Conversation>.IndexKeys
            .Ascending(c => c.ProfileId)
            .Descending(c => c.UpdatedAt);
        _conversations.Indexes.CreateOne(
            new CreateIndexModel<Conversation>(indexKeys, new CreateIndexOptions { Name = "profile_updated" }));
    }

    public async Task<Conversation> CreateAsync(string profileId, string title, CancellationToken ct)
    {
        var conversation = new Conversation
        {
            ProfileId = profileId,
            Title = title,
            Messages = [],
            MessageCount = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _conversations.InsertOneAsync(conversation, cancellationToken: ct);
        return conversation;
    }

    public async Task<Conversation> GetOrCreateForProfileAsync(string profileId)
    {
        // Atomic upsert -- avoids TOCTOU race between Find and Insert
        var now = DateTime.UtcNow;
        var filter = Builders<Conversation>.Filter.Eq(c => c.ProfileId, profileId);
        var update = Builders<Conversation>.Update
            .SetOnInsert(c => c.ProfileId, profileId)
            .SetOnInsert(c => c.Title, "Ny chatt")
            .SetOnInsert(c => c.Messages, new List<ConversationMessage>())
            .SetOnInsert(c => c.MessageCount, 0)
            .SetOnInsert(c => c.CreatedAt, now)
            .Set(c => c.UpdatedAt, now);
        var options = new FindOneAndUpdateOptions<Conversation>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After,
            Sort = Builders<Conversation>.Sort.Descending(c => c.UpdatedAt)
        };

        return await _conversations.FindOneAndUpdateAsync(filter, update, options);
    }

    public async Task<Conversation?> GetByIdAsync(string id, CancellationToken ct)
    {
        return await _conversations.Find(c => c.Id == id).FirstOrDefaultAsync(ct);
    }

    public async Task<List<ConversationSummary>> GetByProfileAsync(string profileId, CancellationToken ct)
    {
        return await _conversations
            .Find(c => c.ProfileId == profileId)
            .SortByDescending(c => c.UpdatedAt)
            .Project(c => new ConversationSummary
            {
                Id = c.Id,
                ProfileId = c.ProfileId,
                Title = c.Title,
                MessageCount = c.MessageCount,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            })
            .ToListAsync(ct);
    }

    public async Task AppendMessageAsync(string id, ConversationMessage message, CancellationToken ct)
    {
        var update = Builders<Conversation>.Update
            .Push(c => c.Messages, message)
            .Inc(c => c.MessageCount, 1)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        await _conversations.UpdateOneAsync(c => c.Id == id, update, cancellationToken: ct);
    }

    public async Task AppendMessagesAsync(string conversationId, ConversationMessage user, ConversationMessage assistant)
    {
        var update = Builders<Conversation>.Update
            .PushEach(c => c.Messages, new[] { user, assistant })
            .Inc(c => c.MessageCount, 2)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        await _conversations.UpdateOneAsync(c => c.Id == conversationId, update);
    }

    public async Task RenameAsync(string id, string profileId, string title, CancellationToken ct)
    {
        var update = Builders<Conversation>.Update
            .Set(c => c.Title, title)
            .Set(c => c.UpdatedAt, DateTime.UtcNow);

        await _conversations.UpdateOneAsync(
            c => c.Id == id && c.ProfileId == profileId,
            update,
            cancellationToken: ct);
    }

    public async Task DeleteAsync(string id, string profileId, CancellationToken ct)
    {
        await _conversations.DeleteOneAsync(
            c => c.Id == id && c.ProfileId == profileId,
            cancellationToken: ct);
    }
}
