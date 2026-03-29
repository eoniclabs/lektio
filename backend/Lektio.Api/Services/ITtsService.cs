namespace Lektio.Api.Services;

public interface ITtsService
{
    bool IsConfigured { get; }
    Task StreamAsync(string text, Stream outputStream, CancellationToken ct = default);
}
