using Lektio.Api.Models;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class TtsEndpoints
{
    private sealed class TtsHandler;

    private const int MaxTextLength = 2000;

    public static void MapTtsEndpoints(this WebApplication app)
    {
        app.MapPost("/api/tts", HandleTts);
    }

    private static IResult HandleTts(
        TtsRequest req,
        ITtsService tts,
        ILogger<TtsHandler> logger,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Text))
            return Results.BadRequest("Text is required.");

        if (req.Text.Length > MaxTextLength)
            return Results.BadRequest($"Text exceeds maximum length of {MaxTextLength} characters.");

        if (!tts.IsConfigured)
        {
            logger.LogWarning("TTS request received but ElevenLabs is not configured.");
            return Results.Problem("TTS not configured", statusCode: 503);
        }

        return Results.Stream(
            outputStream => tts.StreamAsync(req.Text, outputStream, ct),
            "audio/mpeg");
    }
}
