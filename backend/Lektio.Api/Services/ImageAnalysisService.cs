using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Lektio.Api.Models;

namespace Lektio.Api.Services;

public class ImageAnalysisService : IImageAnalysisService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ImageAnalysisService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    private static readonly HashSet<string> ValidMediaTypes =
        ["image/jpeg", "image/png", "image/gif", "image/webp"];

    private const string SystemPrompt =
        "Du är en OCR-assistent. Extrahera allt text från bilden exakt som det är skrivet. " +
        "Bevara formler, rubriker och listor. Svara med JSON: { \"extractedText\": \"...\", \"summary\": \"...\" } " +
        "där summary är en mening som beskriver sidan.";

    public ImageAnalysisService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ImageAnalysisService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<ImageAnalysisResponse> AnalyzeAsync(
        string base64Image,
        string mediaType,
        CancellationToken ct = default)
    {
        if (!ValidMediaTypes.Contains(mediaType))
            throw new ArgumentException($"Unsupported media type: {mediaType}", nameof(mediaType));

        var apiKey = _configuration["Claude:ApiKey"]
            ?? throw new InvalidOperationException("Claude:ApiKey is not configured.");
        var model = _configuration["Claude:Model"] ?? "claude-opus-4-5";

        var requestBody = new
        {
            model,
            max_tokens = 2048,
            system = SystemPrompt,
            messages = new[]
            {
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new
                        {
                            type = "image",
                            source = new
                            {
                                type = "base64",
                                media_type = mediaType,
                                data = base64Image
                            }
                        },
                        new
                        {
                            type = "text",
                            text = "Extrahera allt text från den här boksidan."
                        }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(requestBody, JsonOptions);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient("claude");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/v1/messages")
        {
            Content = content
        };
        request.Headers.Add("x-api-key", apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        using var response = await client.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("Claude Vision API error {Status}: {Error}", response.StatusCode, error);
            throw new HttpRequestException($"Claude Vision API returned {response.StatusCode}");
        }

        var responseJson = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(responseJson);
        var rawText = doc.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString() ?? string.Empty;

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
                ExtractedText = root.TryGetProperty("extractedText", out var et) ? et.GetString() ?? string.Empty : rawText,
                Summary = root.TryGetProperty("summary", out var s) ? s.GetString() ?? string.Empty : string.Empty,
                MediaType = mediaType
            };
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Could not parse Claude Vision JSON response, using raw text.");
            return new ImageAnalysisResponse
            {
                ExtractedText = rawText,
                Summary = string.Empty,
                MediaType = mediaType
            };
        }
    }
}
