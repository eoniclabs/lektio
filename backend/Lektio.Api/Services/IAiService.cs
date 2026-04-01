using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IAiService
{
    Task StreamChatAsync(
        StudentProfile profile,
        List<ConversationMessage> history,
        string userMessage,
        string? imageContext,
        Func<string, Task> onDelta,
        CancellationToken cancellationToken = default);

    Task<string> AskAsync(
        string systemPrompt,
        string userMessage,
        CancellationToken cancellationToken = default);

    Task<string> AnalyzeImageAsync(
        string base64Image,
        string mediaType,
        string systemPrompt,
        string userPrompt,
        CancellationToken cancellationToken = default);
}
