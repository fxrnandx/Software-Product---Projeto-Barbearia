namespace BarberShopApi.Infrastructure
{
  public abstract class BaseConnection
  {

    protected readonly string _connectionString;

    protected BaseConnection(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }
  }
}