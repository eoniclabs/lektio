using MongoDB.Driver;

namespace Lektio.Api.Infrastructure;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetValue<string>("MongoDB:ConnectionString")
            ?? "mongodb://localhost:27017";
        var databaseName = configuration.GetValue<string>("MongoDB:DatabaseName")
            ?? "lektio";

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<T> GetCollection<T>(string name)
    {
        return _database.GetCollection<T>(name);
    }

    public async Task<bool> PingAsync()
    {
        try
        {
            await _database.RunCommandAsync<MongoDB.Bson.BsonDocument>(
                new MongoDB.Bson.BsonDocument("ping", 1));
            return true;
        }
        catch
        {
            return false;
        }
    }
}
