using Microsoft.AspNetCore.Mvc;
using BarberShopApi.Domain.Models.Schedules;
using BarberShopApi.Infrastructure.Schedules;
using Microsoft.AspNetCore.Authorization;
using BarberShopApi.Infrastructure.Employees;

namespace BarberShopApi.Api.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class SchedulesController : ControllerBase
  {
    private readonly SchedulesRepository _repository;
    private readonly EmployeesRepository _employeesRepository;

    public SchedulesController(SchedulesRepository repository, EmployeesRepository employeesRepository)
    {
      _repository = repository;
      _employeesRepository = employeesRepository;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateSchedule([FromBody] ScheduleViewModel schedule)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }
      var employee = await _employeesRepository.GetEmployeeById(schedule.EmployeeId);
      if (employee == null)
      {
        return BadRequest("Employee not found");
      }
      if (!employee.WorkingDays.Select(d => d.ToLower()).Contains(schedule.Date.DayOfWeek.ToString().ToLower()))
      {
        return BadRequest("Employee is not available on this day");
      }

      TimeOnly startHour = TimeOnly.Parse(employee.StartHour);
      TimeOnly stopHour = TimeOnly.Parse(employee.StopHour);
      TimeOnly scheduleTime = TimeOnly.FromDateTime(schedule.Date);
      if (scheduleTime < startHour || scheduleTime > stopHour)
      {
        return BadRequest("Schedule time is outside of employee working hours");
      }
      if (employee.StartInterval != null && employee.IntervalDuration != null)
      {
        TimeOnly startInterval = TimeOnly.Parse(employee.StartInterval);
        TimeOnly stopInterval = startInterval.AddMinutes(employee.IntervalDuration.Value);
        if (scheduleTime >= startInterval && scheduleTime < stopInterval)
        {
          return BadRequest("Schedule time is during employee interval");
        }
      }
      bool hasConflict = await _repository.VerifyScheduleConflict(schedule.EmployeeId, schedule.Date, schedule.Duration);
      if (hasConflict)
      {
        return BadRequest("Schedule conflict with existing appointment");
      }

      var data = schedule.Date.DayOfWeek;
      schedule.UserId = int.Parse(user);
      var result = await _repository.CreateSchedule(schedule);
      return Ok(result);
    }

    [HttpGet]
    [Authorize]
    [Route("report")]
    public async Task<IActionResult> GetReport([FromQuery] ReportQueryModel query)
    {
      var user = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
      if (user == null)
      {
        return Unauthorized();
      }
      var report = await _repository.GetSchedulesReport(query, int.Parse(user));
      return Ok(report);
    }
  }
}