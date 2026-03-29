using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace Lektio.Api.Services;

public class ElevenLabsTtsService : ITtsService
{
    private readonly IHttpClientFactory _factory;
    private readonly IConfiguration _config;
    private readonly ILogger<ElevenLabsTtsService> _logger;

    public ElevenLabsTtsService(
        IHttpClientFactory factory,
        IConfiguration config,
        ILogger<ElevenLabsTtsService> logger)
    {
        _factory = factory;
        _config = config;
        _logger = logger;
    }

    public bool IsConfigured => !string.IsNullOrEmpty(_config["ElevenLabs:ApiKey"]);

    public async Task StreamAsync(string text, HttpResponse response, CancellationToken ct)
    {
        var apiKey = _config["ElevenLabs:ApiKey"]!;
        var voiceId = _config["ElevenLabs:VoiceId"] ?? "pNInz6obpgDQGcFmaJgB";
        var client = _factory.CreateClient("elevenlabs");

        using var req = new HttpRequestMessage(
            HttpMethod.Post,
            $"/v1/text-to-speech/{voiceId}/stream");

        req.Headers.Add("xi-api-key", apiKey);
        req.Content = JsonContent.Create(new TtsPayload
        {
            Text = text,
            ModelId = "eleven_multilingual_v2",
            VoiceSettings = new VoiceSettings
            {
                Stability = 0.5f,
                SimilarityBoost = 0.75f,
            },
        });

        using var res = await client.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);

        if (!res.IsSuccessStatusCode)
        {
            var body = await res.Content.ReadAsStringAsync(ct);
            _logger.LogError("ElevenLabs returned {Status}: {Body}", res.StatusCode, body);
            throw new HttpRequestException($"ElevenLabs error {res.StatusCode}");
        }

        await using var stream = await res.Content.ReadAsStreamAsync(ct);
        await stream.CopyToAsync(response.Body, ct);
    }

    private sealed class TtsPayload
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("model_id")]
        public string ModelId { get; set; } = string.Empty;

        [JsonPropertyName("voice_settings")]
        public VoiceSettings VoiceSettings { get; set; } = new();
    }

    private sealed class VoiceSettings
    {
        [JsonPropertyName("stability")]
        public float Stability { get; set; }

        [JsonPropertyName("similarity_boost")]
        public float SimilarityBoost { get; set; }
    }
}
