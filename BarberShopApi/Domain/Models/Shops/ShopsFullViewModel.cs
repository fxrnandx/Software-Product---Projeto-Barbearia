using BarberShopApi.Domain.Models.Employees;
using BarberShopApi.Domain.Models.Services;

namespace BarberShopApi.Domain.Models.Shops
{
  public class ShopsFullViewModel
  {
    public ShopViewModel? Shop { get; set; }
    public List<ServiceViewModel>? Services { get; set; }
    public List<EmployeeViewModel>? Employees { get; set; }

    public ShopsFullViewModel()
    {
      Shop = null;
      Services = new List<ServiceViewModel>();
      Employees = new List<EmployeeViewModel>();
    }
  }
}