using System.Text.Json;
using Lektio.Api.Models;

namespace Lektio.Api.Services;

public class ExamService : IExamService
{
    private readonly IClaudeService _claudeService;
    private readonly ILogger<ExamService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExamService(IClaudeService claudeService, ILogger<ExamService> logger)
    {
        _claudeService = claudeService;
        _logger = logger;
    }

    public async Task<Exam> GenerateAsync(
        string profileId,
        string topic,
        int questionCount,
        CancellationToken ct)
    {
        var systemPrompt =
            """
            Du är en pedagogisk assistent. Svara ENDAST med ett JSON-array, inga markdown-kodblock eller annan text.
            Formatet är:
            [{"question":"...","options":["A)...","B)...","C)...","D)..."],"correctIndex":0,"explanation":"..."}]
            correctIndex är 0-baserat (0=A, 1=B, 2=C, 3=D).
            """;

        var userMessage = $"Generera {questionCount} flervalsfrågor om ämnet: {topic}";

        var raw = await _claudeService.AskAsync(systemPrompt, userMessage, ct);

        // Strip markdown fences in case Claude wraps the JSON despite instructions
        var cleaned = raw.Trim();
        if (cleaned.StartsWith("```"))
        {
            var firstNewline = cleaned.IndexOf('\n');
            var lastFence = cleaned.LastIndexOf("```");
            if (firstNewline > 0 && lastFence > firstNewline)
                cleaned = cleaned[(firstNewline + 1)..lastFence].Trim();
        }

        List<ExamQuestion> questions;
        try
        {
            questions = JsonSerializer.Deserialize<List<ExamQuestion>>(cleaned, JsonOptions)
                ?? throw new InvalidOperationException("Deserialized result was null.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse exam JSON from Claude. Raw: {Raw}", raw);
            throw new InvalidOperationException($"Failed to parse exam questions from Claude response: {ex.Message}");
        }

        return new Exam
        {
            ProfileId = profileId,
            Topic = topic,
            Questions = questions,
            CreatedAt = DateTime.UtcNow
        };
    }
}
