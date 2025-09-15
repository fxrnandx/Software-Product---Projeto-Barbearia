namespace BarberShopApi.Domain.Models.Services
{
  public class ServiceViewModel
  {
    public int? Id { get; set; }
    public required int ShopId { get; set; }
    public required string Name { get; set; }
    public required decimal Price { get; set; }
    public required int Duration { get; set; }
    public string? Description { get; set; }
    public string? Image { get; set; }
  }
}