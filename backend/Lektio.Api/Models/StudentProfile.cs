using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Lektio.Api.Models;

public class StudentProfile
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string SchoolLevel { get; set; } = string.Empty;

    public StudentPreferences Preferences { get; set; } = new();

    public List<ConceptMastery> ConceptMasteries { get; set; } = new();

    public int StreakDays { get; set; }

    public DateTime? LastActiveDate { get; set; }

    public int TotalMessages { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class StudentPreferences
{
    public string ExplanationStyle { get; set; } = "visual_first";

    public bool VoiceEnabled { get; set; } = true;
}
