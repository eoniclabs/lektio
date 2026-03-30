namespace Lektio.Api.Models;

public class ExamQuestion
{
    public string Question { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();   // 4 options, A-D
    public int CorrectIndex { get; set; }                 // 0-3
    public string Explanation { get; set; } = string.Empty;
}
