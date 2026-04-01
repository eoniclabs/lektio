using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lektio.Api.Models;

public class Conversation
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonRepresentation(BsonType.ObjectId)]
    public string ProfileId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public List<ConversationMessage> Messages { get; set; } = [];

    public int MessageCount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class ConversationMessage
{
    public string Role { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class ConversationSummary
{
    public string Id { get; set; } = null!;

    public string ProfileId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public int MessageCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }
}
