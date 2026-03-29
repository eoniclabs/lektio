namespace Lektio.Api.Models;

public class ImageAnalysisResponse
{
    public string ExtractedText { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public string MediaType { get; set; } = "image/jpeg";
}
