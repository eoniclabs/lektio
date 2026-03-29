using Lektio.Api.Endpoints;
using Lektio.Api.Infrastructure;
using Lektio.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// MongoDB
builder.Services.AddSingleton<MongoDbContext>();

// Repositories (singleton – stateless, hold collection references)
builder.Services.AddSingleton<IProfileRepository, ProfileRepository>();
builder.Services.AddSingleton<IConversationRepository, ConversationRepository>();
builder.Services.AddSingleton<INotebookRepository, NotebookRepository>();
builder.Services.AddSingleton<IStreakService, StreakService>();

// Claude HTTP client
builder.Services.AddHttpClient("claude", client =>
{
    client.BaseAddress = new Uri("https://api.anthropic.com");
    client.Timeout = TimeSpan.FromSeconds(120);
});

// ElevenLabs HTTP client
builder.Services.AddHttpClient("elevenlabs", client =>
{
    client.BaseAddress = new Uri("https://api.elevenlabs.io");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Claude service (scoped – uses IHttpClientFactory)
builder.Services.AddScoped<IClaudeService, ClaudeService>();
builder.Services.AddScoped<IImageAnalysisService, ImageAnalysisService>();
builder.Services.AddScoped<ITtsService, ElevenLabsTtsService>();

// JSON options – camelCase for frontend compatibility
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

// Endpoints
app.MapHealthEndpoints();
app.MapProfileEndpoints();
app.MapChatEndpoints();
app.MapImageEndpoints();
app.MapTtsEndpoints();
app.MapNotebookEndpoints();

app.Run();
