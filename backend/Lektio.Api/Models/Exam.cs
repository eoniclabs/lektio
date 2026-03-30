using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lektio.Api.Models;

public class Exam
{
    [BsonId][BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    public string ProfileId { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public List<ExamQuestion> Questions { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}
