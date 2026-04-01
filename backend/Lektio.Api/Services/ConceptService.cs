using System.Text.Json;
using Lektio.Api.Models;

namespace Lektio.Api.Services;

public class ConceptService : IConceptService
{
    private readonly IAiService _aiService;
    private readonly IProfileRepository _profileRepository;
    private readonly ILogger<ConceptService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private const string SystemPrompt =
        """
        Du är en pedagogisk assistent som identifierar ämnesbegrepp i förklarande text.
        Svara ENBART med ett JSON-array av strängar (begrepp på svenska), max 5 begrepp.
        Välj bara konkreta, namngivna begrepp och termer – inte generiska ord som "exempel" eller "förklaring".
        Exempel: ["fotosyntesen","klorofyll","ljusenergi"]
        """;

    public ConceptService(
        IAiService claudeService,
        IProfileRepository profileRepository,
        ILogger<ConceptService> logger)
    {
        _aiService = claudeService;
        _profileRepository = profileRepository;
        _logger = logger;
    }

    public async Task ExtractAndUpdateAsync(string profileId, string explanationText, CancellationToken ct)
    {
        // Trim long texts to keep the Claude call small
        var truncated = explanationText.Length > 1500
            ? explanationText[..1500]
            : explanationText;

        string raw;
        try
        {
            raw = await _aiService.AskAsync(SystemPrompt, truncated, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Concept extraction Claude call failed for profile {ProfileId}", profileId);
            return;
        }

        // Strip markdown fences
        var cleaned = raw.Trim();
        if (cleaned.StartsWith("```"))
        {
            var firstNewline = cleaned.IndexOf('\n');
            var lastFence = cleaned.LastIndexOf("```");
            if (firstNewline > 0 && lastFence > firstNewline)
                cleaned = cleaned[(firstNewline + 1)..lastFence].Trim();
        }

        List<string> concepts;
        try
        {
            concepts = JsonSerializer.Deserialize<List<string>>(cleaned, JsonOptions)
                       ?? [];
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse concept JSON for profile {ProfileId}. Raw: {Raw}", profileId, raw);
            return;
        }

        if (concepts.Count == 0) return;

        await _profileRepository.UpsertConceptMasteriesAsync(profileId, concepts, ct);
    }
}
