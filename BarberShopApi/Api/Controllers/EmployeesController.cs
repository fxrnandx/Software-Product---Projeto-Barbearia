using BarberShopApi.Domain.Models;
using BarberShopApi.Domain.Models.Employees;
using BarberShopApi.Infrastructure.Employees;
using BarberShopApi.Infrastructure.Images;
using BarberShopApi.Infrastructure.Shops;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.BarberShopApi.Controllers
{
  [Route("api/[controller]")]
  [ApiController]
  public class EmployeesController : ControllerBase
  {
    private readonly ImagesRepository _imagesRepository;
    private readonly EmployeesRepository _employeesRepository;
    private readonly ShopsRepository _shopsRepository;

    public EmployeesController(ImagesRepository imagesRepository, EmployeesRepository employeesRepository, ShopsRepository shopsRepository)
    {
      _imagesRepository = imagesRepository;
      _employeesRepository = employeesRepository;
      _shopsRepository = shopsRepository;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetEmployees([FromQuery] PageableQueryInputModel pageableQuery)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }
      var employees = await _employeesRepository.GetEmployees(pageableQuery, int.Parse(user));
      if (employees == null)
      {
        return NotFound();
      }
      return Ok(employees);
    }

    [HttpGet]
    [Route("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetEmployee(int id)
    {
      var employee = await _employeesRepository.GetEmployeeById(id);
      if (employee == null)
      {
        return NotFound();
      }
      return Ok(employee);
    }

    [HttpGet]
    [Route("count")]
    [AllowAnonymous]
    public async Task<IActionResult> GetEmployeeCount()
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }

      var count = await _employeesRepository.GetEmployeeCount(int.Parse(user));
      return Ok(count);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateEmployee([FromBody] EmployeeViewModel employeeModel)
    {


      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }

      try
      {
        await _shopsRepository.VerifyOwner(employeeModel.ShopId, int.Parse(user));
      }
      catch (UnauthorizedAccessException)
      {
        return Forbid();
      }
      var imageViewModel = employeeModel.Photo != null ? await _imagesRepository.CreateImage(employeeModel.Photo, "webp") : null;
      var employee = await _employeesRepository.CreateEmployee(employeeModel, imageViewModel?.Id);
      if (employee == null)
      {
        return BadRequest();
      }

      return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, employee);
    }

    [HttpPut]
    [Route("{id:int}")]
    [Authorize]
    public async Task<IActionResult> PutEmployee(int id, [FromBody] EmployeeViewModel employeeModel)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }

      try
      {
        await _shopsRepository.VerifyOwner(employeeModel.ShopId, int.Parse(user));
      }
      catch (UnauthorizedAccessException)
      {
        return Forbid();
      }

      var imageViewModel = employeeModel.Photo != null ? await _imagesRepository.CreateImage(employeeModel.Photo, "webp") : null;
      var employee = await _employeesRepository.UpdateEmployee(employeeModel, imageViewModel?.Id);
      if (employee == null)
      {
        return BadRequest();
      }

      return Ok(employee);
    }

    [HttpDelete]
    [Route("{id:int}")]
    [Authorize]
    public async Task<IActionResult> DeleteEmployee(int id)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }

      var employee = await _employeesRepository.GetEmployeeById(id);
      if (employee == null)
      {
        return NotFound();
      }

      try
      {
        await _shopsRepository.VerifyOwner(employee.ShopId, int.Parse(user));
      }
      catch (UnauthorizedAccessException)
      {
        return Forbid();
      }

      await _employeesRepository.DeleteEmployee(id);

      return NoContent();
    }

  }
}