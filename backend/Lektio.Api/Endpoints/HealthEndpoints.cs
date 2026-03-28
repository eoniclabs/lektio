using Lektio.Api.Infrastructure;

namespace Lektio.Api.Endpoints;

public static class HealthEndpoints
{
    public static void MapHealthEndpoints(this WebApplication app)
    {
        app.MapGet("/api/health", async (MongoDbContext db) =>
        {
            var mongoOk = await db.PingAsync();

            return Results.Ok(new
            {
                status = mongoOk ? "healthy" : "degraded",
                timestamp = DateTime.UtcNow,
                services = new
                {
                    mongodb = mongoOk ? "connected" : "disconnected"
                }
            });
        });
    }
}
