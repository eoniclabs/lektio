namespace Lektio.Api.Models;

public class ChatRequest
{
    public string Message { get; set; } = null!;

    public string? ConversationId { get; set; }

    public string ProfileId { get; set; } = null!;

    public string? ImageContext { get; set; }
}

public class ChatResponse
{
    public string Text { get; set; } = null!;

    public string? Narration { get; set; }

    public List<VisualPrimitive>? VisualPrimitives { get; set; }

    public string ConversationId { get; set; } = null!;
}

public class VisualPrimitive
{
    public string Type { get; set; } = null!;

    public List<VisualStep> Steps { get; set; } = [];
}

public class VisualStep
{
    public string Action { get; set; } = null!;

    public Dictionary<string, object> Data { get; set; } = [];

    public string Narration { get; set; } = null!;

    public int? AudioDurationMs { get; set; }

    public string Transition { get; set; } = "fade";

    public int DurationMs { get; set; } = 1000;
}

public class SseEvent
{
    public string Type { get; set; } = null!;

    public string? Token { get; set; }

    public ChatResponse? Response { get; set; }

    public string? Error { get; set; }
}
