using System.Text.Json;
using Lektio.Api.Models;

namespace Lektio.Api.Services;

public class ImageAnalysisService : IImageAnalysisService
{
    private readonly IAiService _aiService;
    private readonly ILogger<ImageAnalysisService> _logger;

    private static readonly HashSet<string> ValidMediaTypes =
        ["image/jpeg", "image/png", "image/gif", "image/webp"];

    private const string SystemPrompt =
        """
        Du är en OCR-assistent. Extrahera allt text från bilden exakt som det är skrivet.
        Bevara formler, rubriker och listor. Svara med JSON: { "extractedText": "...", "summary": "..." }
        där summary är en mening som beskriver sidan.
        """;

    private const string UserPrompt = "Extrahera allt text från den här boksidan.";

    public ImageAnalysisService(
        IAiService aiService,
        ILogger<ImageAnalysisService> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    public async Task<ImageAnalysisResponse> AnalyzeAsync(
        string base64Image,
        string mediaType,
        CancellationToken ct = default)
    {
        if (!ValidMediaTypes.Contains(mediaType))
            throw new ArgumentException($"Unsupported media type: {mediaType}", nameof(mediaType));

        var rawText = await _aiService.AnalyzeImageAsync(base64Image, mediaType, SystemPrompt, UserPrompt, ct);

        // Strip markdown code fences if present
        if (rawText.StartsWith("```"))
        {
            var start = rawText.IndexOf('\n') + 1;
            var end = rawText.LastIndexOf("```");
            rawText = end > start ? rawText[start..end].Trim() : rawText;
        }

        try
        {
            using var parsed = JsonDocument.Parse(rawText);
            var root = parsed.RootElement;
            return new ImageAnalysisResponse
            {
                ExtractedText = root.TryGetProperty("extractedText", out var et) ? et.GetString() ?? string.Empty : string.Empty,
                Summary = root.TryGetProperty("summary", out var s) ? s.GetString() ?? string.Empty : string.Empty,
                MediaType = mediaType
            };
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Could not parse Vision JSON response, using raw text.");
            return new ImageAnalysisResponse
            {
                ExtractedText = rawText,
                Summary = string.Empty,
                MediaType = mediaType
            };
        }
    }
}
