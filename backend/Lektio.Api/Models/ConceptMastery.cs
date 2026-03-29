namespace Lektio.Api.Models;

public class ConceptMastery
{
    public string Concept { get; set; } = string.Empty;

    public int Level { get; set; }

    public DateTime LastSeenAt { get; set; }
}
