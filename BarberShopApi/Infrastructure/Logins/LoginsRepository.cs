using BarberShopApi.Domain.Models.Logins;
using BarberShopApi.Shared;
using Dapper;
using Npgsql;

namespace BarberShopApi.Infrastructure.Logins
{
  public class LoginsRepository : BaseConnection, IService<LoginsRepository>
  {
    public LoginsRepository(IConfiguration configuration) : base(configuration) { }

    public async Task<bool> IsLoginValid(LoginInputModel loginInput)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT salt, password_hash AS password FROM login join accounts on login.account_id = accounts.id join users on users.id = accounts.""userId"" WHERE users.email = @Email;";
      var result = await conn.QuerySingleOrDefaultAsync<LoginInputModel>(sql, param: new { Email = loginInput.Email });
      if (result == null)
      {
        return false;
      }
      loginInput.Salt = result.Salt;
      return result.Password == loginInput.HashPassword();
    }
  }
}