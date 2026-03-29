using Lektio.Api.Models;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class ImageEndpoints
{
    private sealed class ImageHandler;

    public static void MapImageEndpoints(this WebApplication app)
    {
        app.MapPost("/api/image/analyze", HandleAnalyzeAsync);
    }

    private static async Task<IResult> HandleAnalyzeAsync(
        ImageAnalysisRequest req,
        IImageAnalysisService imageService,
        ILogger<ImageHandler> logger,
        CancellationToken ct)
    {
        if (string.IsNullOrEmpty(req.Image))
            return Results.BadRequest("Image is required");

        try
        {
            var result = await imageService.AnalyzeAsync(req.Image, req.MediaType, ct);
            return Results.Ok(result);
        }
        catch (ArgumentException ex)
        {
            return Results.BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Image analysis failed");
            return Results.Problem("Image analysis failed");
        }
    }
}
