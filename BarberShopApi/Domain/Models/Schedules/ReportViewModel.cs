namespace BarberShopApi.Domain.Models.Schedules
{
  public class ReportViewModel
  {
    public required int Quantity { get; set; }
    public required string Datetime { get; set; }
    public required string Label { get; set; }
  }
}