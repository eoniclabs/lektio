using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Lektio.Api.Models;

namespace Lektio.Api.Services;

public class OpenAiService : IAiService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OpenAiService> _logger;

    public OpenAiService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<OpenAiService> logger)
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
        var (apiKey, model) = GetConfig();

        var effectiveMessage = imageContext is not null
            ? $"[Sidinnehåll från foto:]\n{imageContext}\n\n[Elevens fråga:]\n{userMessage}"
            : userMessage;

        var systemPrompt = SystemPromptBuilder.Build(profile);

        var messages = new List<object>
        {
            new { role = "system", content = systemPrompt }
        };
        messages.AddRange(history.Select(m => (object)new { role = m.Role, content = m.Content }));
        messages.Add(new { role = "user", content = effectiveMessage });

        var requestBody = new
        {
            model,
            max_tokens = 2048,
            messages,
            stream = true
        };

        var json = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient("openai");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/v1/chat/completions")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await client.SendAsync(
            request,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("OpenAI API error {Status}: {Error}", response.StatusCode, error);
            throw new HttpRequestException($"OpenAI API returned {response.StatusCode}");
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
                var choices = doc.RootElement.GetProperty("choices");
                if (choices.GetArrayLength() == 0) continue;

                var delta = choices[0].GetProperty("delta");
                if (delta.TryGetProperty("content", out var contentToken)
                    && contentToken.ValueKind == JsonValueKind.String)
                {
                    var token = contentToken.GetString() ?? string.Empty;
                    if (!string.IsNullOrEmpty(token))
                        await onDelta(token);
                }
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Failed to parse OpenAI SSE line: {Line}", line);
            }
        }
    }

    public async Task<string> AskAsync(
        string systemPrompt,
        string userMessage,
        CancellationToken cancellationToken = default)
    {
        var (apiKey, model) = GetConfig();

        var requestBody = new
        {
            model,
            max_tokens = 4096,
            messages = new object[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userMessage }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient("openai");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/v1/chat/completions")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await client.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("OpenAI API error {Status}: {Error}", response.StatusCode, error);
            throw new HttpRequestException($"OpenAI API returned {response.StatusCode}");
        }

        return await ExtractTextAsync(response, cancellationToken);
    }

    public async Task<string> AnalyzeImageAsync(
        string base64Image,
        string mediaType,
        string systemPrompt,
        string userPrompt,
        CancellationToken cancellationToken = default)
    {
        var (apiKey, model) = GetConfig();

        var dataUri = $"data:{mediaType};base64,{base64Image}";

        var requestBody = new
        {
            model,
            max_tokens = 4096,
            messages = new object[]
            {
                new { role = "system", content = systemPrompt },
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        new
                        {
                            type = "image_url",
                            image_url = new { url = dataUri }
                        },
                        new
                        {
                            type = "text",
                            text = userPrompt
                        }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var client = _httpClientFactory.CreateClient("openai");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/v1/chat/completions")
        {
            Content = content
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        using var response = await client.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("OpenAI Vision API error {Status}: {Error}", response.StatusCode, error);
            throw new HttpRequestException($"OpenAI Vision API returned {response.StatusCode}");
        }

        return await ExtractTextAsync(response, cancellationToken);
    }

    private (string ApiKey, string Model) GetConfig()
    {
        var apiKey = _configuration["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI:ApiKey is not configured.");
        var model = _configuration["OpenAI:Model"] ?? "gpt-4o";
        return (apiKey, model);
    }

    private static async Task<string> ExtractTextAsync(HttpResponseMessage response, CancellationToken ct)
    {
        var responseJson = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(responseJson);
        if (doc.RootElement.TryGetProperty("choices", out var choices)
            && choices.ValueKind == JsonValueKind.Array
            && choices.GetArrayLength() > 0
            && choices[0].TryGetProperty("message", out var message)
            && message.TryGetProperty("content", out var contentEl)
            && contentEl.ValueKind == JsonValueKind.String)
        {
            return contentEl.GetString() ?? string.Empty;
        }

        return string.Empty;
    }
}
