using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lektio.Api.Models;

public class NotebookEntry
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string ProfileId { get; set; } = string.Empty;

    public string? MessageId { get; set; }

    public string Content { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public List<string> Tags { get; set; } = new();

    public DateTime CreatedAt { get; set; }
}
