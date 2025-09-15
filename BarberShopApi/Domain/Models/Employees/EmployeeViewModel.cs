using BarberShopApi.Domain.Models.Schedules;

namespace BarberShopApi.Domain.Models.Employees;

public class EmployeeViewModel
{
  public int? Id { get; set; }
  public required int ShopId { get; set; }
  public required string Name { get; set; }
  public required string StartHour { get; set; }
  public required string StopHour { get; set; }
  public string? StartInterval { get; set; }
  public int? IntervalDuration { get; set; }
  public string? Photo { get; set; }
  public string[]? WorkingDays { get; set; }
  public List<ScheduleViewModel>? Schedules { get; set; }
}
