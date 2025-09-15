using Dapper;
using Npgsql;
using BarberShopApi.Shared;
using BarberShopApi.Domain.Models.Employees;
using BarberShopApi.Domain.Models;

namespace BarberShopApi.Infrastructure.Employees
{
  public class EmployeesRepository : BaseConnection, IService<EmployeesRepository>
  {
    public EmployeesRepository(IConfiguration configuration) : base(configuration) { }

    public async Task<IEnumerable<EmployeeViewModel>?> GetEmployees(PageableQueryInputModel pagination, int OwnerId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"SELECT employees.id, 
                            employees.name, 
                            (SELECT path FROM images WHERE id = imageid) AS photo,
                            starthour::text,
                            shopid,
                            stophour::text,
                            startinterval::text,
                            intervalduration,
                            employees.workingdays
                       FROM employees
                       JOIN shops 
                         ON employees.shopid = shops.id
                      WHERE shops.owner_id = @OwnerId
                   ORDER BY id
                      LIMIT @Limit OFFSET @Offset";

      var result = await conn.QueryAsync<EmployeeViewModel>(sql, new { pagination.Limit, pagination.Offset, OwnerId });
      return result;
    }

    public async Task<EmployeeViewModel?> GetEmployeeById(int id)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"SELECT id, 
                            name, 
                            (SELECT path FROM images WHERE id = imageid) AS photo,
                            starthour::text,
                            stophour::text,
                            startinterval::text,
                            intervalduration,
                            workingdays,
                            shopid
                       FROM employees
                      WHERE id = @id";

      var result = await conn.QuerySingleOrDefaultAsync<EmployeeViewModel>(sql, new { id });
      return result;
    }

    public async Task<int> GetEmployeeCount(int OwnerId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"SELECT COUNT(*) FROM employees
                      JOIN shops ON employees.shopid = shops.id
                     WHERE shops.owner_id = @OwnerId";

      var result = await conn.ExecuteScalarAsync<int>(sql, new { OwnerId });
      return result;
    }

    public async Task<EmployeeViewModel?> CreateEmployee(EmployeeViewModel employee, int? ImageId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"INSERT INTO employees (shopid, name, starthour, stophour, startinterval, intervalduration, imageid, workingdays)
                     VALUES (@ShopId, @Name, @StartHour::time, @StopHour::time, @StartInterval::time, @IntervalDuration, @ImageId, @WorkingDays)
                  RETURNING id, name, shopid, starthour::text, stophour::text, startinterval::text, intervalduration, workingdays,
                            (SELECT path FROM images WHERE id = imageid) AS photo";

      var result = await conn.QuerySingleOrDefaultAsync<EmployeeViewModel>(sql, new
      {
        employee.ShopId,
        employee.Name,
        employee.StartHour,
        employee.StopHour,
        employee.StartInterval,
        employee.IntervalDuration,
        ImageId,
        employee.WorkingDays
      });
      return result;
    }

    public async Task<bool> DeleteEmployee(int id)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"DELETE FROM employees WHERE id = @id";

      var result = await conn.ExecuteAsync(sql, new { id });
      return result > 0;
    }

    public async Task<EmployeeViewModel?> UpdateEmployee(EmployeeViewModel employee, int? ImageId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"UPDATE employees
                        SET name = @Name,
                            starthour = @StartHour::time,
                            stophour = @StopHour::time,
                            startinterval = @StartInterval::time,
                            intervalduration = @IntervalDuration,
                            imageid = @ImageId,
                            workingdays = @WorkingDays
                      WHERE id = @Id
                   RETURNING id, name, shopid, starthour::text, stophour::text, startinterval::text, intervalduration, workingdays,
                             (SELECT path FROM images WHERE id = imageid) AS photo";

      var result = await conn.QuerySingleOrDefaultAsync<EmployeeViewModel>(sql, new
      {
        employee.Id,
        employee.Name,
        employee.StartHour,
        employee.StopHour,
        employee.StartInterval,
        employee.IntervalDuration,
        ImageId,
        employee.WorkingDays
      });
      return result;
    }

    public async Task<IEnumerable<EmployeeViewModel>> GetEmployeesByShopId(int shopId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = @"SELECT id, 
                            name, 
                            (SELECT path FROM images WHERE id = imageid) AS photo,
                            starthour::text,
                            stophour::text,
                            startinterval::text,
                            intervalduration,
                            workingdays,
                            shopid
                       FROM employees
                      WHERE shopid = @shopId";

      var result = await conn.QueryAsync<EmployeeViewModel>(sql, new { shopId });
      return result;
    }
  }
}