using BarberShopApi.Domain.Models.Images;
using BarberShopApi.Shared;
using Dapper;
using Npgsql;

namespace BarberShopApi.Infrastructure.Images
{
  public class ImagesRepository : BaseConnection, IService<ImagesRepository>
  {
    public ImagesRepository(IConfiguration configuration) : base(configuration) { }

    public async Task<ImageViewModel?> CreateImage(string image, string type)
    {
      using NpgsqlConnection conn = new(_connectionString);
      var uniqueFileName = $"{DateTime.Now.Ticks}_{Guid.NewGuid()}.{type}";
      var filePath = Path.Combine("/projects/BarberShopApp/barbershop/public", uniqueFileName);
      try
      {
          File.WriteAllBytes(filePath, Convert.FromBase64String(image));
      }
      catch (Exception ex)
      {
        Console.WriteLine(ex);
        return null;
      }

      const string sql = @"INSERT INTO images (path, type) VALUES (@Path, @Type) RETURNING id, path, type;";
      var result = await conn.QuerySingleOrDefaultAsync<ImageViewModel>(sql, param: new
      {
        Path = $"/{uniqueFileName}",
        Type = type
      });
      return result;
    }
  }
}
