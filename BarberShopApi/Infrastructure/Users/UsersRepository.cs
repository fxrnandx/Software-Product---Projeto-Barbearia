using BarberShopApi.Domain.Models.Users;
using BarberShopApi.Shared;
using Dapper;
using Npgsql;

namespace BarberShopApi.Infrastructure.Users
{
  public class UsersRepository : BaseConnection, IService<UsersRepository>
  {
    public UsersRepository(IConfiguration configuration) : base(configuration) { }

    public async Task GetUserById(int id)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT id, name, email FROM users WHERE id = @Id;";
      var result = await conn.QuerySingleOrDefaultAsync(sql, param: new { Id = id });
    }

    public async Task<UserViewModel?> GetUserByToken(string token)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT id, name, email, provider FROM accounts WHERE id_token = @Token;";
      var result = await conn.QuerySingleOrDefaultAsync(sql, param: new { Token = token });
      return result;
    }

    public async Task<UserViewModel?> GetUserByEmail(string email)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT id, name, email FROM users WHERE email = @Email;";
      var result = await conn.QuerySingleOrDefaultAsync<UserViewModel>(sql, param: new { Email = email });
      return result;
    }

    public async Task<UserViewModel> CreateUser(string email, string name)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"INSERT INTO users (name, email) VALUES (@Name, @Email) RETURNING id, name, email;";
      var result = await conn.QuerySingleAsync<UserViewModel>(sql, param: new { Name = name, Email = email });
      return result;
    }
  }
}