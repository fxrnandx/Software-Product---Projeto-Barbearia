
using BarberShopApi.Domain.Models;
using BarberShopApi.Domain.Models.Services;
using BarberShopApi.Infrastructure.Images;
using BarberShopApi.Infrastructure.Services;
using BarberShopApi.Infrastructure.Shops;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.BarberShopApi.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class ServicesController : ControllerBase
  {

    private readonly ServicesRepository _servicesRepository;
    private readonly ImagesRepository _imagesRepository;
    private readonly ShopsRepository _shopsRepository;

    public ServicesController(ServicesRepository servicesRepository, ImagesRepository imagesRepository, ShopsRepository shopsRepository)
    {
      _servicesRepository = servicesRepository;
      _imagesRepository = imagesRepository;
      _shopsRepository = shopsRepository;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetServices([FromQuery] PageableQueryInputModel pagination)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }

      var services = await _servicesRepository.GetServices(pagination, int.Parse(user));
      return Ok(services);
    }

    [HttpGet]
    [Route("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetService(int id)
    {
      var service = await _servicesRepository.GetService(id);
      if (service == null)
      {
        return NotFound();
      }
      return Ok(service);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> PostService([FromBody] ServiceViewModel service)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }
      try
      {
        await _shopsRepository.VerifyOwner(service.ShopId, int.Parse(user));
      }
      catch (UnauthorizedAccessException)
      {
        return Forbid();
      }

      var imageViewModel = service.Image != null ? await _imagesRepository.CreateImage(service.Image, "webp") : null;
      var createdService = await _servicesRepository.CreateService(service, imageViewModel?.Id);
      if (createdService == null)
      {
        return BadRequest();
      }

      return CreatedAtAction(nameof(GetService), new { id = createdService.Id }, createdService);
    }

    [HttpDelete]
    [Route("{id:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteService(int id)
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

      var service = await _servicesRepository.GetService(id);
      if (service == null)
      {
        return NotFound();
      }

      await _servicesRepository.DeleteService(id);
      return NoContent();
    }

    [HttpPut]
    [Route("{id:int}")]
    [Authorize]
    public async Task<IActionResult> PutService(int id, [FromBody] ServiceViewModel service)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }
      try
      {
        await _shopsRepository.VerifyOwner(service.ShopId, int.Parse(user));
      }
      catch (UnauthorizedAccessException)
      {
        return Forbid();
      }

      var imageViewModel = service.Image != null ? await _imagesRepository.CreateImage(service.Image, "webp") : null;
      var updatedService = await _servicesRepository.UpdateService(id, service, imageViewModel?.Id);
      if (updatedService == null)
      {
        return BadRequest();
      }

      return Ok(updatedService);
    }

    [HttpGet]
    [Route("count")]
    [Authorize]
    public async Task<IActionResult> GetServiceCount()
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }

      var count = await _servicesRepository.GetServiceCount(int.Parse(user));
      return Ok(new { count });
    }

  }
}