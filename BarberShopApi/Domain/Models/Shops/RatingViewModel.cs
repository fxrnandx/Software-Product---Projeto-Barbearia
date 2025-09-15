namespace BarberShopApi.Domain.Models.Shops
{
  public class RatingViewModel
  {
    public int? Id { get; set; }
    public int? ShopId { get; set; }
    public int? UserId { get; set; }
    public required int Value { get; set; }
    public string? Comment { get; set; }
    public string? Date { get; set; }
    public string? UserName { get; set; }
    public string? Image { get; set; }
    public string[]? Images { get; set; }
  }
}