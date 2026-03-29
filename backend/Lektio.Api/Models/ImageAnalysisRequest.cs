namespace Lektio.Api.Models;

public class ImageAnalysisRequest
{
    public string Image { get; set; } = string.Empty;

    public string MediaType { get; set; } = "image/jpeg";
}
