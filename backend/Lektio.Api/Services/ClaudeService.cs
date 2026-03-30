using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Lektio.Api.Models;

namespace Lektio.Api.Services;

public class ClaudeService : IClaudeService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ClaudeService> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };

    public ClaudeService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ClaudeService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task StreamChatAsync(
        StudentProfile profile,
        List<ConversationMessage> history,
        string userMessage,
        string? imageContext,
        Func<string, Task> onDelta,
        CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Claude:ApiKey"]
            ?? throw new InvalidOperationException("Claude:ApiKey is not configured.");
        var model = _configuration["Claude:Model"] ?? "claude-opus-4-5";

        var effectiveMessage = imageContext is not null
            ? $"[Sidinnehåll från foto:]\n{imageContext}\n\n[Elevens fråga:]\n{userMessage}"
            : userMessage;

        // Build messages from history + current user message.
        // Callers are responsible for trimming history to the desired window size.
        var messages = history
            .Select(m => new { role = m.Role, content = m.Content })
            .Append(new { role = "user", content = effectiveMessage })
            .ToList<object>();

        var systemPrompt = SystemPromptBuilder.Build(profile);

        var requestBody = new
        {
            model,
            max_tokens = 2048,
            system = systemPrompt,
            messages,
            stream = true
        };

        var json = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient("claude");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/v1/messages")
        {
            Content = content
        };
        request.Headers.Add("x-api-key", apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("text/event-stream"));

        using var response = await client.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Claude API error {Status}: {Error}", response.StatusCode, error);
            throw new HttpRequestException($"Claude API returned {response.StatusCode}");
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var reader = new StreamReader(stream);

        string? line;
        while ((line = await reader.ReadLineAsync(cancellationToken)) is not null
               && !cancellationToken.IsCancellationRequested)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            if (!line.StartsWith("data: ")) continue;

            var data = line["data: ".Length..];
            if (data == "[DONE]") break;

            try
            {
                using var doc = JsonDocument.Parse(data);
                var root = doc.RootElement;

                var type = root.GetProperty("type").GetString();

                if (type == "content_block_delta")
                {
                    var delta = root.GetProperty("delta");
                    if (delta.GetProperty("type").GetString() == "text_delta")
                    {
                        var token = delta.GetProperty("text").GetString() ?? string.Empty;
                        if (!string.IsNullOrEmpty(token))
                            await onDelta(token);
                    }
                }
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Failed to parse SSE line: {Line}", line);
            }
        }
    }

    public async Task<string> AskAsync(
        string systemPrompt,
        string userMessage,
        CancellationToken cancellationToken = default)
    {
        var apiKey = _configuration["Claude:ApiKey"]
            ?? throw new InvalidOperationException("Claude:ApiKey is not configured.");
        var model = _configuration["Claude:Model"] ?? "claude-opus-4-5";

        var requestBody = new
        {
            model,
            max_tokens = 4096,
            system = systemPrompt,
            messages = new[]
            {
                new { role = "user", content = userMessage }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient("claude");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/v1/messages")
        {
            Content = content
        };
        request.Headers.Add("x-api-key", apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");

        using var response = await client.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Claude API error {Status}: {Error}", response.StatusCode, error);
            throw new HttpRequestException($"Claude API returned {response.StatusCode}");
        }

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        using var doc = JsonDocument.Parse(responseJson);
        if (doc.RootElement.TryGetProperty("content", out var contentElement)
            && contentElement.ValueKind == JsonValueKind.Array
            && contentElement.GetArrayLength() > 0
            && contentElement[0].TryGetProperty("text", out var textElement)
            && textElement.ValueKind == JsonValueKind.String)
        {
            return textElement.GetString() ?? string.Empty;
        }

        return string.Empty;
    }
}
