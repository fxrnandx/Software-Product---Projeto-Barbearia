using BarberShopApi.Api.Authentication;
using BarberShopApi.Domain.Models.Accounts;
using BarberShopApi.Domain.Models.Logins;
using BarberShopApi.Domain.Models.Users;
using BarberShopApi.Infrastructure.Logins;
using BarberShopApi.Infrastructure.Users;
using BarberShopApi.Shared;
using Dapper;
using Npgsql;

namespace BarberShopApi.Infrastructure.Accounts
{
  public class AccountsRepository : BaseConnection, IService<AccountsRepository>
  {

    private readonly TokenHandler tokenHandler;
    public AccountsRepository(IConfiguration configuration) : base(configuration)
    {
      tokenHandler = new TokenHandler(configuration);
    }


    public async Task<AccountsViewModel?> GetAccountUserByToken(string token)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT ""userId"" AS id FROM accounts WHERE id_token = @Token OR access_token = @Token2;";
      var result = await conn.QuerySingleOrDefaultAsync<AccountsViewModel>(sql, param: new { Token = token, Token2 = token });
      return result;
    }

    public async Task<AccountsViewModel?> CreateAccount(LoginInputModel login, string type, string provider)
    {
      using NpgsqlConnection conn = new(_connectionString);

      conn.Open();

      await using var tx = await conn.BeginTransactionAsync();
      try
      {
        string sql = @"SELECT id, name, email FROM users WHERE email = @Email;";
        LoginInputModel credentials;

        var user = await conn.QuerySingleOrDefaultAsync<UserViewModel>(sql, param: new { Email = login.Email }, transaction: tx);
        if (user == null)
        {
          sql = @"INSERT INTO users (name, email) VALUES (@Name, @Email) RETURNING id, name, email;";
          user = await conn.QuerySingleAsync<UserViewModel>(sql, param: new { Name = login.Email, login.Email }, transaction: tx);

          sql = @"INSERT INTO login (salt, password_hash) VALUES (@Salt, @Password) RETURNING id, salt, password_hash AS password;";
          credentials = await conn.QuerySingleAsync<LoginInputModel>(sql, param: new { login.Salt, Password = login.HashPassword() }, transaction: tx);
        }
        else
        {
          sql = @"SELECT login.id, salt, password_hash AS password FROM login JOIN accounts ON accounts.type = @Type AND accounts.provider = @Provider AND login.id::varchar(255) = accounts.""providerAccountId"" WHERE accounts.""userId"" = @UserId;";
          credentials = await conn.QuerySingleAsync<LoginInputModel>(sql, param: new { UserId = user.Id, Type = type, Provider = provider }, transaction: tx);
          login.Salt = credentials.Salt;
          if (credentials.Password != login.HashPassword())
          {
            throw new Exception("Invalid credentials");
          }
        }

        string token = tokenHandler.GenerateToken(user.Id, user.Email, user.Name);
        int expiresAt = tokenHandler.GetTokenExpirationTime(token);
        sql = @"MERGE INTO accounts USING (SELECT @UserId AS userid, @Type AS type, @Provider AS provider, @Token AS id_token, @ExpiresAt AS expires_at) AS new_account
        ON accounts.""userId"" = new_account.userid and accounts.type = new_account.type and accounts.provider = new_account.provider
        WHEN MATCHED THEN
            UPDATE SET id_token = new_account.id_token, expires_at = new_account.expires_at
        WHEN NOT MATCHED THEN
            INSERT (""userId"", type, provider, id_token, expires_at, token_type,""providerAccountId"") VALUES (new_account.userid, new_account.type, new_account.provider, new_account.id_token, new_account.expires_at, 'bearer', @ProviderAccountId)";
        await conn.ExecuteAsync(sql, param: new { UserId = user.Id, Type = type, Provider = provider, Token = token, ExpiresAt = expiresAt, ProviderAccountId = credentials.Id }, transaction: tx);

        sql = @"SELECT id, provider, id_token FROM accounts WHERE ""userId"" = @UserId AND type = @Type AND provider = @Provider;";
        var account = await conn.QuerySingleOrDefaultAsync<AccountsViewModel>(sql, param: new { UserId = user.Id, Type = type, Provider = provider }, transaction: tx);
        await tx.CommitAsync();
        return account;
      }
      catch (Exception ex)
      {
        await tx.RollbackAsync();
        throw new Exception("Error creating account", ex);
      } finally
      {
        await conn.CloseAsync();
      }
    }
  }
}