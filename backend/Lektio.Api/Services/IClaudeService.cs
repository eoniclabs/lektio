using Lektio.Api.Models;

namespace Lektio.Api.Services;

public interface IClaudeService
{
    Task StreamChatAsync(
        StudentProfile profile,
        List<ConversationMessage> history,
        string userMessage,
        string? imageContext,
        Func<string, Task> onDelta,
        CancellationToken cancellationToken = default);
}
