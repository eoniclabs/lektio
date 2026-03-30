using Lektio.Api.Models;
using Lektio.Api.Services;

namespace Lektio.Api.Endpoints;

public static class ExamEndpoints
{
    public static void MapExamEndpoints(this WebApplication app)
    {
        app.MapPost("/api/exams/generate", async (
            GenerateExamRequest req,
            IExamService examService,
            IExamRepository examRepo,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(req.ProfileId) || string.IsNullOrWhiteSpace(req.Topic))
                return Results.BadRequest("ProfileId and Topic are required.");

            var questionCount = req.QuestionCount ?? 5;
            if (questionCount is < 1 or > 20)
                return Results.BadRequest("QuestionCount must be between 1 and 20.");

            Exam exam;
            try
            {
                exam = await examService.GenerateAsync(req.ProfileId, req.Topic, questionCount, ct);
            }
            catch (InvalidOperationException ex)
            {
                return Results.Problem(ex.Message, statusCode: 502);
            }
            catch (HttpRequestException ex)
            {
                return Results.Problem($"Claude API error: {ex.Message}", statusCode: 502);
            }

            var saved = await examRepo.SaveAsync(exam, ct);
            return Results.Created($"/api/exams/{saved.Id}", saved);
        });

        app.MapGet("/api/exams/{examId}", async (
            string examId,
            IExamRepository examRepo,
            CancellationToken ct) =>
        {
            var exam = await examRepo.GetByIdAsync(examId, ct);
            return exam is null ? Results.NotFound() : Results.Ok(exam);
        });

        app.MapGet("/api/profiles/{profileId}/exams", async (
            string profileId,
            IExamRepository examRepo,
            CancellationToken ct) =>
        {
            var exams = await examRepo.GetByProfileAsync(profileId, ct);
            return Results.Ok(exams);
        });

        app.MapPost("/api/exams/{examId}/submit", async (
            string examId,
            SubmitExamRequest req,
            IExamRepository examRepo,
            IExamResultRepository resultRepo,
            CancellationToken ct) =>
        {
            if (string.IsNullOrWhiteSpace(req.ProfileId) || req.Answers is null)
                return Results.BadRequest("ProfileId and Answers are required.");

            var exam = await examRepo.GetByIdAsync(examId, ct);
            if (exam is null)
                return Results.NotFound($"Exam {examId} not found.");

            if (req.Answers.Count != exam.Questions.Count)
                return Results.BadRequest("Number of answers must match number of questions.");

            var score = exam.Questions
                .Where((q, i) => req.Answers[i] == q.CorrectIndex)
                .Count();

            var result = new ExamResult
            {
                ExamId = examId,
                ProfileId = req.ProfileId,
                Answers = req.Answers,
                Score = score,
                Total = exam.Questions.Count,
                CompletedAt = DateTime.UtcNow
            };

            var saved = await resultRepo.SaveAsync(result, ct);
            return Results.Ok(new ExamSubmitResponse(
                saved.Id,
                saved.ExamId,
                saved.ProfileId,
                saved.Answers,
                saved.Score,
                saved.Total,
                saved.CompletedAt,
                exam));
        });

        app.MapGet("/api/profiles/{profileId}/exam-results", async (
            string profileId,
            IExamResultRepository resultRepo,
            CancellationToken ct) =>
        {
            var results = await resultRepo.GetByProfileAsync(profileId, ct);
            return Results.Ok(results);
        });
    }
}

public record GenerateExamRequest(string ProfileId, string Topic, int? QuestionCount);
public record SubmitExamRequest(string ProfileId, List<int> Answers);
public record ExamSubmitResponse(
    string Id,
    string ExamId,
    string ProfileId,
    List<int> Answers,
    int Score,
    int Total,
    DateTime CompletedAt,
    Exam Exam);
