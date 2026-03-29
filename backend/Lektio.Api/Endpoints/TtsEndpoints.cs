using Lektio.Api.Models;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class TtsEndpoints
{
    private sealed class TtsHandler;

    public static void MapTtsEndpoints(this WebApplication app)
    {
        app.MapPost("/api/tts", HandleTtsAsync);
    }

    private static async Task HandleTtsAsync(
        TtsRequest req,
        ITtsService tts,
        ILogger<TtsHandler> logger,
        HttpContext ctx,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.Text))
        {
            ctx.Response.StatusCode = 400;
            return;
        }

        if (!tts.IsConfigured)
        {
            ctx.Response.StatusCode = 503;
            await ctx.Response.WriteAsync("TTS not configured", ct);
            return;
        }

        ctx.Response.ContentType = "audio/mpeg";
        await tts.StreamAsync(req.Text, ctx.Response, ct);
    }
}
