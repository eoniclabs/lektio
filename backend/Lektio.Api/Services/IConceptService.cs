namespace Lektio.Api.Services;

public interface IConceptService
{
    /// <summary>
    /// Extracts concept names from an AI explanation text,
    /// then upserts mastery entries (0–5 scale) for the given profile.
    /// </summary>
    Task ExtractAndUpdateAsync(string profileId, string explanationText, CancellationToken ct);
}
