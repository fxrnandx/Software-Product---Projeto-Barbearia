namespace BarberShopApi.Domain.Models.Schedules;

public class ScheduleViewModel
{
  public int? Id { get; set; }
  public required int EmployeeId { get; set; }
  public required DateTime Date { get; set; }
  public required int Duration { get; set; }
  public int? UserId { get; set; }
}
