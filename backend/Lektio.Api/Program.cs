using System.Text;
using Lektio.Api.Infrastructure;
using Lektio.Api.Endpoints;
using Lektio.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// MongoDB
builder.Services.AddSingleton<MongoDbContext>();

// Repositories (singleton -- stateless, hold collection references)
builder.Services.AddSingleton<IProfileRepository, ProfileRepository>();
builder.Services.AddSingleton<IConversationRepository, ConversationRepository>();
builder.Services.AddSingleton<INotebookRepository, NotebookRepository>();
builder.Services.AddSingleton<IStreakService, StreakService>();
builder.Services.AddSingleton<IExamRepository, ExamRepository>();
builder.Services.AddSingleton<IExamResultRepository, ExamResultRepository>();

// AI provider HTTP clients
builder.Services.AddHttpClient("claude", client =>
{
    client.BaseAddress = new Uri("https://api.anthropic.com");
    client.Timeout = TimeSpan.FromSeconds(120);
});
builder.Services.AddHttpClient("openai", client =>
{
    client.BaseAddress = new Uri("https://api.openai.com");
    client.Timeout = TimeSpan.FromSeconds(120);
});

// ElevenLabs HTTP client
builder.Services.AddHttpClient("elevenlabs", client =>
{
    client.BaseAddress = new Uri("https://api.elevenlabs.io");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// AI service -- provider selected via Ai:Provider config ("Claude" or "OpenAI")
var aiProvider = builder.Configuration["Ai:Provider"] ?? "Claude";
if (aiProvider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase))
    builder.Services.AddScoped<IAiService, OpenAiService>();
else
    builder.Services.AddScoped<IAiService, ClaudeService>();

builder.Services.AddScoped<IImageAnalysisService, ImageAnalysisService>();
builder.Services.AddScoped<ITtsService, ElevenLabsTtsService>();
builder.Services.AddScoped<IExamService, ExamService>();
builder.Services.AddScoped<IConceptService, ConceptService>();

// JWT authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]
    ?? throw new InvalidOperationException("Jwt:Secret not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "Lektio",
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddSingleton<JwtService>();

// JSON options -- camelCase for frontend compatibility
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Endpoints
app.MapHealthEndpoints();
app.MapAuthEndpoints();
app.MapProfileEndpoints();
app.MapChatEndpoints();
app.MapImageEndpoints();
app.MapTtsEndpoints();
app.MapNotebookEndpoints();
app.MapExamEndpoints();
app.MapConversationEndpoints();

app.Run();
