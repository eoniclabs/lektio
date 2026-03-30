using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lektio.Api.Models;

public class ExamResult
{
    [BsonId][BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;
    public string ExamId { get; set; } = string.Empty;
    public string ProfileId { get; set; } = string.Empty;
    public List<int> Answers { get; set; } = new();      // selected option index per question
    public int Score { get; set; }                        // number of correct answers
    public int Total { get; set; }
    public DateTime CompletedAt { get; set; }
}
