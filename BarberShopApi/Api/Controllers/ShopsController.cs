using BarberShopApi.Domain.Models;
using BarberShopApi.Domain.Models.Images;
using BarberShopApi.Domain.Models.Shops;
using BarberShopApi.Infrastructure.Employees;
using BarberShopApi.Infrastructure.Images;
using BarberShopApi.Infrastructure.Schedules;
using BarberShopApi.Infrastructure.Services;
using BarberShopApi.Infrastructure.Shops;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.BarberShopApi.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class ShopsController : ControllerBase
  {
    private readonly ShopsRepository _shopsRepository;
    private readonly ImagesRepository _imagesRepository;
    private readonly EmployeesRepository _employeesRepository;
    private readonly ServicesRepository _servicesRepository;
    private readonly SchedulesRepository _schedulesRepository;

    public ShopsController(ShopsRepository shopsRepository, ImagesRepository imagesRepository, EmployeesRepository employeesRepository, ServicesRepository servicesRepository, SchedulesRepository schedulesRepository)
    {
      _shopsRepository = shopsRepository;
      _imagesRepository = imagesRepository;
      _employeesRepository = employeesRepository;
      _servicesRepository = servicesRepository;
      _schedulesRepository = schedulesRepository;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> PostShop([FromBody] ShopViewModel shop)
    {
      if (!shop.ValidateCnpj(shop.Cnpj))
      {
        return BadRequest("Invalid CNPJ");
      }
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }
      var imageViewModel = shop.Logo != null ? await _imagesRepository.CreateImage(shop.Logo, "webp") : null;
      var createdShop = await _shopsRepository.CreateShop(shop, imageViewModel?.Id, int.Parse(user));
      if (createdShop == null)
      {
        return StatusCode(500, "Error saving shop");
      }
      return Ok(createdShop);
    }

    [HttpGet]
    [Route("")]
    [AllowAnonymous]
    public async Task<IActionResult> GetShops([FromQuery] PageableQueryInputModel pageableQuery)
    {
      var shops = await _shopsRepository.GetShops(pageableQuery);
      return Ok(shops);
    }

    [HttpGet]
    [Route("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetShop(int id)
    {
      var shop = await _shopsRepository.GetShopById(id);
      if (shop == null)
      {
        return NotFound();
      }
      return Ok(shop);
    }

    [HttpDelete]
    [Route("{id:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteShop(int id)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }
      try
      {
        await _shopsRepository.VerifyOwner(id, int.Parse(user));
      }
      catch (UnauthorizedAccessException)
      {
        return Forbid();
      }

      await _shopsRepository.DeleteShop(id);

      return NoContent();
    }

    [HttpPut]
    [Route("{id:int}")]
    [Authorize]
    public async Task<IActionResult> PutShop(int id, [FromBody] ShopViewModel shop)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }

      try
      {
        await _shopsRepository.VerifyOwner(id, int.Parse(user));
      }
      catch (UnauthorizedAccessException)
      {
        return Forbid();
      }

      var imageViewModel = shop.Logo != null ? await _imagesRepository.CreateImage(shop.Logo, "webp") : null;
      var updatedShop = await _shopsRepository.UpdateShop(id, shop, imageViewModel?.Id);
      if (updatedShop == null)
      {
        return StatusCode(500, "Error updating shop");
      }
      return Ok(updatedShop);
    }

    [HttpGet]
    [Route("count")]
    [AllowAnonymous]
    public async Task<IActionResult> GetShopCount()
    {
      var count = await _shopsRepository.GetShopCount();
      return Ok(count);
    }

    [HttpGet]
    [Route("owner")]
    [Authorize]
    public async Task<IActionResult> GetOwnedShops()
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }
      var shops = await _shopsRepository.GetShopsByOwner(int.Parse(user));
      return Ok(shops);
    }

    [HttpGet]
    [Route("owner/count")]
    [Authorize]
    public async Task<IActionResult> GetOwnedShopsCount()
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }
      var count = await _shopsRepository.GetShopsCountByOwner(int.Parse(user));
      return Ok(count);
    }

    [HttpGet]
    [Route("full/{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetFullShop(int id)
    {
      ShopsFullViewModel shop = new ShopsFullViewModel();
      await Task.WhenAll(
        Task.Run(async () => shop.Shop = await _shopsRepository.GetShopById(id)),
        Task.Run(async () => shop.Services = (await _servicesRepository.GetServicesByShopId(id)).ToList()),
        Task.Run(async () => shop.Employees = (await _employeesRepository.GetEmployeesByShopId(id)).ToList())
      );
      await Task.WhenAll(
        Task.Run(async () =>
        {
          foreach (var employee in shop.Employees)
          {
            employee.Schedules = (await _schedulesRepository.GetSchedulesByEmployeeId(employee.Id)).ToList();
          }
        })
      );
      if (shop.Shop == null)
      {
        return NotFound();
      }
      return Ok(shop);
    }

    [HttpGet]
    [Route("{id:int}/ratings")]
    [AllowAnonymous]
    public async Task<IActionResult> GetShopRatings(int id, [FromQuery] PageableQueryInputModel pageableQuery)
    {
      var ratings = await _shopsRepository.GetRatingsByShopId(id, pageableQuery);
      return Ok(ratings);
    }

    [HttpGet]
    [Route("{id:int}/ratings/count")]
    [AllowAnonymous]
    public async Task<IActionResult> GetShopRatingsCount(int id)
    {
      var count = await _shopsRepository.GetRatingsCountByShopId(id);
      return Ok(count);
    }

    [HttpPost]
    [Route("{id:int}/ratings")]
    [Authorize]
    public async Task<IActionResult> PostShopRating(int id, [FromBody] RatingViewModel rating)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }
      List<ImageViewModel> images = new List<ImageViewModel>();
      if (rating.Images != null)
      {
        foreach (var img in rating.Images)
        {
          var imgModel = await _imagesRepository.CreateImage(img, "webp");
          if (imgModel != null)
          {
            images.Add(imgModel);
          }
        }
      }
      rating.ShopId = id;
      rating.UserId = int.Parse(user);
      var createdRating = await _shopsRepository.CreateRating(rating, images.Select(i => i.Id).ToArray());
      if (createdRating == null)
      {
        return StatusCode(500, "Error saving rating");
      }
      return Ok(createdRating);
    }
  }
}
