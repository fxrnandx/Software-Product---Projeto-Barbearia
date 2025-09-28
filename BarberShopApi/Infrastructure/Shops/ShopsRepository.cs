using BarberShopApi.Domain.Models;
using BarberShopApi.Domain.Models.Shops;
using BarberShopApi.Shared;
using Dapper;
using Npgsql;

namespace BarberShopApi.Infrastructure.Shops
{
  public class ShopsRepository : BaseConnection, IService<ShopsRepository>
  {
    public ShopsRepository(IConfiguration configuration) : base(configuration) { }

    public async Task<ShopViewModel> CreateShop(ShopViewModel shop, int? imageId, int ownerId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"INSERT INTO shops (name, 
                                              zip_code, 
                                              city, 
                                              street, 
                                              number, 
                                              logo_id, 
                                              cnpj, 
                                              owner_id, 
                                              email, 
                                              phone,
                                              workingdays,
                                              openat,
                                              closeat,
                                              state,
                                              location) 
                                      VALUES (@Name, 
                                              @ZipCode, 
                                              @City, 
                                              @Street, 
                                              @Number, 
                                              @ImageId, 
                                              @Cnpj, 
                                              @OwnerId, 
                                              @Email, 
                                              @Phone, 
                                              @WorkingDays, 
                                              @OpenAt::time, 
                                              @CloseAt::time,
                                              @State,
                                              ST_SetSRID(ST_MakePoint(@Longitude, @Latitude), 4326))
                                    RETURNING id, 
                                              name, 
                                              zip_code, 
                                              city, 
                                              street, 
                                              number, 
                                              (SELECT path FROM images WHERE id = logo_id) AS logo, 
                                              cnpj, 
                                              email, 
                                              phone,
                                              workingdays,
                                              openat::text AS openat,
                                              closeat::text AS closeat,
                                              state,
                                              ST_X(location::geometry) AS longitude,
                                              ST_Y(location::geometry) AS latitude;";
      var result = await conn.QuerySingleAsync<ShopViewModel>(sql, param: new
      {
        shop.Name,
        shop.ZipCode,
        shop.City,
        shop.Street,
        shop.Number,
        ImageId = imageId,
        shop.Cnpj,
        OwnerId = ownerId,
        shop.Email,
        shop.Phone,
        shop.WorkingDays,
        shop.OpenAt,
        shop.CloseAt,
        shop.State,
        shop.Longitude,
        shop.Latitude
      });
      return result;
    }

    public async Task<ShopViewModel?> GetShopById(int id)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT id, 
                                  name, 
                                  zip_code AS ZipCode, 
                                  city, 
                                  street, 
                                  number, 
                                  (SELECT path FROM images WHERE id = logo_id) AS logo,
                                  email,
                                  phone,
                                  cnpj,
                                  openat::text AS openat,
                                  closeat::text AS closeat,
                                  workingdays,
                                  (SELECT AVG(value) FROM ratings WHERE shopid = shops.id) AS rating,
                                  state,
                                  ST_X(location::geometry) AS longitude,
                                  ST_Y(location::geometry) AS latitude
                             FROM shops 
                            WHERE id = @Id;";
      var result = await conn.QuerySingleOrDefaultAsync<ShopViewModel>(sql, param: new { Id = id });
      return result;
    }

    public async Task<IEnumerable<ShopViewModel>> GetShops(PageableQueryInputModel pageableQuery)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT id, 
                                  name, 
                                  zip_code AS ZipCode, 
                                  city, 
                                  street, 
                                  number, 
                                  (SELECT path FROM images WHERE id = logo_id) AS logo, 
                                  email, 
                                  phone, 
                                  cnpj,
                                  openat::text AS openat,
                                  closeat::text AS closeat,
                                  workingdays,
                                  (SELECT AVG(value) FROM ratings WHERE shopid = shops.id) AS rating,
                                  state
                                  FROM shops 
                         ORDER BY id 
                            LIMIT @Limit 
                           OFFSET @Offset;";
      var result = await conn.QueryAsync<ShopViewModel>(sql, param: new
      {
        pageableQuery.Limit,
        pageableQuery.Offset
      });
      return result;
    }

    public async Task VerifyOwner(int shopId, int userId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT COUNT(*) 
                             FROM shops 
                            WHERE id = @ShopId 
                              AND owner_id = @UserId;";
      var count = await conn.ExecuteScalarAsync<int>(sql, param: new { ShopId = shopId, UserId = userId });
      if (count == 0)
      {
        throw new UnauthorizedAccessException("You do not own this shop.");
      }
    }

    public async Task DeleteShop(int shopId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"DELETE FROM shops WHERE id = @ShopId;";
      await conn.ExecuteAsync(sql, param: new { ShopId = shopId });
    }

    public async Task<ShopViewModel> UpdateShop(int shopId, ShopViewModel shop, int? imageId)
    {
      using NpgsqlConnection conn = new(_connectionString);
      var imageField = imageId.HasValue ? "logo_id = @ImageId," : "";
      string sql = @$"UPDATE shops 
                              SET name = @Name, 
                                  zip_code = @ZipCode, 
                                  city = @City, 
                                  street = @Street, 
                                  number = @Number, 
                                  {imageField}
                                  cnpj = @Cnpj,
                                  email = @Email,
                                  phone = @Phone,
                                  workingdays = @WorkingDays,
                                  openat = @OpenAt::time,
                                  closeat = @CloseAt::time,
                                  state = @State,
                                  location = ST_SetSRID(ST_MakePoint(@Longitude, @Latitude), 4326)
                            WHERE id = @ShopId 
                        RETURNING id, 
                                  name, 
                                  zip_code AS ZipCode, 
                                  city, 
                                  street, 
                                  number, 
                                  (SELECT path FROM images WHERE id = logo_id) AS logo,
                                  email,
                                  phone,
                                  cnpj,
                                  openat::text AS openat,
                                  closeat::text AS closeat,
                                  workingdays,
                                  state,
                                  ST_X(location::geometry) AS longitude,
                                  ST_Y(location::geometry) AS latitude;";
      var result = await conn.QuerySingleAsync<ShopViewModel>(sql, param: new
      {
        shop.Name,
        shop.ZipCode,
        shop.City,
        shop.Street,
        shop.Number,
        ImageId = imageId,
        shop.Cnpj,
        shop.Email,
        shop.Phone,
        ShopId = shopId,
        shop.WorkingDays,
        shop.OpenAt,
        shop.CloseAt,
        shop.State,
        shop.Longitude,
        shop.Latitude
      });
      return result;
    }

    public async Task<int> GetShopCount()
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT COUNT(*) FROM shops;";
      var count = await conn.ExecuteScalarAsync<int>(sql);
      return count;
    }

    public async Task<IEnumerable<ShopViewModel>> GetShopsByOwner(int ownerId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT id, 
                                  name, 
                                  zip_code AS ZipCode, 
                                  city, 
                                  street, 
                                  number, 
                                  (SELECT path FROM images WHERE id = logo_id) AS logo, 
                                  email, 
                                  phone, 
                                  cnpj, 
                                  openat::text AS openat, 
                                  closeat::text AS closeat, 
                                  workingdays
                             FROM shops 
                            WHERE owner_id = @OwnerId
                         ORDER BY id;";
      var result = await conn.QueryAsync<ShopViewModel>(sql, param: new { OwnerId = ownerId });
      return result;
    }

    public async Task<int> GetShopsCountByOwner(int ownerId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT COUNT(*) FROM shops WHERE owner_id = @OwnerId;";
      var count = await conn.ExecuteScalarAsync<int>(sql, param: new { OwnerId = ownerId });
      return count;
    }

    public async Task<IEnumerable<RatingViewModel>> GetRatingsByShopId(int ShopId, PageableQueryInputModel pageableQuery)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT ratings.id, 
                                  userid, 
                                  shopid, 
                                  value, 
                                  comment,
                                  date::text AS date,
                                  users.name AS username,
                                  users.image,
                                  (SELECT array_agg(path) FROM images WHERE id = ANY(ratings.images)) AS images
                             FROM ratings
                             JOIN users 
                               ON ratings.userid = users.id
                            WHERE shopid = @ShopId
                         ORDER BY id DESC
                         LIMIT @Limit OFFSET @Offset;";
      var result = await conn.QueryAsync<RatingViewModel>(sql, param: new { ShopId, pageableQuery.Limit, pageableQuery.Offset });
      return result;
    }

    public async Task<RatingViewModel> CreateRating(RatingViewModel rating, int[]? imageIds)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"INSERT INTO ratings (userid, shopid, value, comment, images, date) 
                                      VALUES (@UserId, @ShopId, @Value, @Comment, @Images, CURRENT_DATE) 
                                    RETURNING id, userid AS UserId, shopid AS ShopId, value AS Value, comment AS Comment,
                                              (SELECT array_agg(path) FROM images WHERE id = ANY(ratings.images)) AS Images,
                                              date,
                                              (SELECT name FROM users WHERE id = ratings.userid) AS UserName,
                                              (SELECT image FROM users WHERE id = ratings.userid) AS UserImage;";
      var result = await conn.QuerySingleAsync<RatingViewModel>(sql, param: new
      {
        rating.UserId,
        rating.ShopId,
        rating.Value,
        rating.Comment,
        Images = imageIds
      });
      return result;
    }

    public async Task<int> GetRatingsCountByShopId(int shopId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT COUNT(*) FROM ratings WHERE shopid = @ShopId;";
      var count = await conn.ExecuteScalarAsync<int>(sql, param: new { ShopId = shopId });
      return count;
    }

    public async Task<IEnumerable<ShopViewModel>> GetNearbyShops(decimal latitude, decimal longitude, decimal radius)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT id, 
                                  name, 
                                  zip_code AS ZipCode, 
                                  city, 
                                  street, 
                                  number, 
                                  (SELECT path FROM images WHERE id = logo_id) AS logo,
                                  email,
                                  phone,
                                  cnpj,
                                  openat::text AS openat,
                                  closeat::text AS closeat,
                                  workingdays,
                                  (SELECT AVG(value) FROM ratings WHERE shopid = shops.id) AS rating,
                                  state,
                                  ST_Distance(location, ST_SetSRID(ST_MakePoint(@Longitude, @Latitude), 4326)) / 1000 AS distance
                             FROM shops
                            WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(@Longitude, @Latitude), 4326), @Radius * 1000)
                         ORDER BY distance;";
      var result = await conn.QueryAsync<ShopViewModel>(sql, param: new { Latitude = latitude, Longitude = longitude, Radius = radius });
      return result;
    }

  }
}
