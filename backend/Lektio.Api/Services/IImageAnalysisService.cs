using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IImageAnalysisService
{
    Task<ImageAnalysisResponse> AnalyzeAsync(string base64Image, string mediaType, CancellationToken ct = default);
}
