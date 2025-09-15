namespace BarberShopApi.Domain.Models
{
  public class PageableQueryInputModel
  {
    public int Limit { get; set; } = 10;
    public int Offset { get; set; } = 0;
  }

}
