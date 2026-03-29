namespace Lektio.Api.Services;

public interface ITtsService
{
    bool IsConfigured { get; }
    Task StreamAsync(string text, HttpResponse response, CancellationToken ct = default);
}
