using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;

namespace BarberShopApi.Api.Authentication;

public class TokenHandler
{
  private readonly string _secretKey;

  public TokenHandler(IConfiguration configuration)
  {
    _secretKey = configuration.GetValue<string>("SecretKey") ?? throw new ArgumentNullException("SecretKey is not configured");
  }

  public string GenerateToken(int userId, string userEmail, string userName)
  {
    SymmetricSecurityKey key = new(System.Text.Encoding.UTF8.GetBytes(_secretKey));

    List<Claim> claims = new()
    {
      new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
      new Claim(JwtRegisteredClaimNames.Email, userEmail),
      new Claim(JwtRegisteredClaimNames.Name, userName),
      new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };
    JwtSecurityToken token = new(
        issuer: "local",
        audience: "local",
        claims: claims,
        notBefore: DateTime.UtcNow,
        expires: DateTime.UtcNow.AddHours(24),
        signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
    );
    return new JwtSecurityTokenHandler().WriteToken(token);
  }

  public int GetTokenExpirationTime(string token)
  {
    var jwtToken = new JwtSecurityTokenHandler().ReadJwtToken(token);
    var expirationTime = jwtToken.ValidTo;
    var unixTimestamp = ((DateTimeOffset)expirationTime).ToUnixTimeSeconds();
    return (int)unixTimestamp;
  }
}