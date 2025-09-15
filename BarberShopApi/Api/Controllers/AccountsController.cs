using System.Text.RegularExpressions;
using BarberShopApi.Domain.Models.Logins;
using BarberShopApi.Infrastructure.Accounts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.BarberShopApi.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  [AllowAnonymous]
  public class AccountsController : ControllerBase
  {
    private readonly AccountsRepository _accountsRepository;

    public AccountsController(AccountsRepository accountsRepository)
    {
      _accountsRepository = accountsRepository;
    }

    [HttpPost]
    public async Task<IActionResult> PostAccount([FromBody] LoginInputModel accountInput)
    {
      
      var hasNumber = new Regex(@"[0-9]+");
      var hasUpperChar = new Regex(@"[A-Z]+");
      var validated = hasNumber.IsMatch(accountInput.Password) && hasUpperChar.IsMatch(accountInput.Password);
      if (!validated)
      {
        return BadRequest("Password must contain at least one number and one uppercase letter.");
      }
      try
      {
        var account = await _accountsRepository.CreateAccount(accountInput, "basic", "self");
        return Ok(account); 
      }
      catch (Exception ex)
      {
        return Unauthorized();
      }
    }

  }
}
