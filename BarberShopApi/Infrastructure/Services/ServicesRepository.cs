using Dapper;
using Npgsql;
using BarberShopApi.Shared;
using BarberShopApi.Domain.Models.Services;
using BarberShopApi.Domain.Models;

namespace BarberShopApi.Infrastructure.Services
{
  public class ServicesRepository : BaseConnection, IService<ServicesRepository>
  {
    public ServicesRepository(IConfiguration configuration) : base(configuration) { }

    public async Task<IEnumerable<ServiceViewModel>?> GetServices(PageableQueryInputModel pagination, int UserId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"SELECT services.id, 
                            services.name, 
                            services.price, 
                            services.duration, 
                            services.description,
                            services.shopid, 
                            (SELECT path FROM images WHERE id = services.imageid) AS image
                       FROM services
                       JOIN shops ON services.shopid = shops.id
                      WHERE shops.owner_id = @UserId
                   ORDER BY services.id
                      LIMIT @Limit OFFSET @Offset";

      var result = await conn.QueryAsync<ServiceViewModel>(sql, new { pagination.Limit, pagination.Offset, UserId });
      return result;
    }

    public async Task<ServiceViewModel?> GetService(int Id)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"SELECT id, 
                            name, 
                            price, 
                            duration, 
                            description,
                            shopid, 
                            (SELECT path FROM images WHERE id = imageid) AS image
                       FROM services
                      WHERE id = @Id";

      var result = await conn.QuerySingleOrDefaultAsync<ServiceViewModel>(sql, new { Id });
      return result;
    }

    public async Task<ServiceViewModel?> CreateService(ServiceViewModel service, int? ImageId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"INSERT INTO services (shopid, name, price, duration, description, imageid)
                     VALUES (@ShopId, @Name, @Price, @Duration, @Description, @ImageId)
                  RETURNING id, name, price, duration, description,
                            (SELECT path FROM images WHERE id = imageid) AS image";

      var result = await conn.QuerySingleOrDefaultAsync<ServiceViewModel>(sql, new
      {
        service.ShopId,
        service.Name,
        service.Price,
        service.Duration,
        service.Description,
        ImageId
      });

      return result;
    }

    public async Task DeleteService(int Id)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"DELETE FROM services WHERE id = @Id";

      await conn.ExecuteAsync(sql, new { Id });
    }

    public async Task<int> GetServiceCount(int OwnerId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"SELECT COUNT(*) FROM services
                      JOIN shops ON services.shopid = shops.id
                     WHERE shops.owner_id = @OwnerId";

      var result = await conn.ExecuteScalarAsync<int>(sql, new { OwnerId });
      return result;
    }

    public async Task<ServiceViewModel?> UpdateService(int Id, ServiceViewModel service, int? ImageId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"UPDATE services 
                        SET name = @Name, 
                            price = @Price, 
                            duration = @Duration, 
                            description = @Description, 
                            imageid = COALESCE(@ImageId, imageid)
                      WHERE id = @Id
                   RETURNING id, name, price, duration, description,
                             (SELECT path FROM images WHERE id = imageid) AS image";

      var result = await conn.QuerySingleOrDefaultAsync<ServiceViewModel>(sql, new
      {
        Id,
        service.Name,
        service.Price,
        service.Duration,
        service.Description,
        ImageId
      });

      return result;
    }

    public async Task<IEnumerable<ServiceViewModel>> GetServicesByShopId(int ShopId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"SELECT id, 
                            name, 
                            price, 
                            duration, 
                            description,
                            shopid, 
                            (SELECT path FROM images WHERE id = imageid) AS image
                       FROM services
                      WHERE shopid = @ShopId
                   ORDER BY id";

      var result = await conn.QueryAsync<ServiceViewModel>(sql, new { ShopId });
      return result;
    }
  }
}