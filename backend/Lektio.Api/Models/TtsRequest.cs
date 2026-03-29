namespace Lektio.Api.Models;

public class TtsRequest
{
    public string Text { get; set; } = string.Empty;
    public string VoiceId { get; set; } = "";
}
