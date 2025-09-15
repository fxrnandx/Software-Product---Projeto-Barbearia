using System.Text.Encodings.Web;
using BarberShopApi.Infrastructure.Accounts;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;

namespace BarberShopApi.Api.Authentication;
public class ShopAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
  private readonly AccountsRepository _accountsRepository;
  public ShopAuthenticationHandler(
      IOptionsMonitor<AuthenticationSchemeOptions> options,
      ILoggerFactory logger,
      UrlEncoder encoder,
      ISystemClock clock,
      AccountsRepository accountsRepository)
  : base(options, logger, encoder, clock)
  {
    _accountsRepository = accountsRepository;
  }

  protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
  {
    // Read token from HTTP request header
    string authorizationHeader = Request.Headers["Authorization"]!;
    if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
    {
      return AuthenticateResult.Fail("no token");
    }
    // Remove "Bearer" to get pure token data
    var token = authorizationHeader.Substring("Bearer ".Length);
    var user = await _accountsRepository.GetAccountUserByToken(token);
    if (user == null)
    {
      return AuthenticateResult.Fail("invalid token");
    }
    try
    {
      var principal = new System.Security.Claims.ClaimsPrincipal();
      principal.AddIdentity(new System.Security.Claims.ClaimsIdentity(new[]
      {
          new System.Security.Claims.Claim("id", user.Id.ToString())
      }, "Bearer"));

      return AuthenticateResult.Success(new AuthenticationTicket(
          principal,
          new AuthenticationProperties(),
          JwtBearerDefaults.AuthenticationScheme));
    }
    catch (Exception ex)
    {
      //oops
      return AuthenticateResult.Fail(ex);
    }
  }
}