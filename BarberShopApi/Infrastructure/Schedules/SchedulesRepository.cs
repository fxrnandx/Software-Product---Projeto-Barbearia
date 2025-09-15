using Dapper;
using Npgsql;
using BarberShopApi.Shared;
using BarberShopApi.Domain.Models.Schedules;

namespace BarberShopApi.Infrastructure.Schedules
{
  public class SchedulesRepository : BaseConnection, IService<SchedulesRepository>
  {
    public SchedulesRepository(IConfiguration configuration) : base(configuration) { }

    public async Task<ScheduleViewModel> CreateSchedule(ScheduleViewModel schedule)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"INSERT INTO schedules (employeeid, date, duration, userid) 
                                      VALUES (@EmployeeId, @Date, @Duration, @UserId) 
                                    RETURNING id, employeeid AS EmployeeId, date AS Date, duration AS Duration, userid AS UserId;";
      var result = await conn.QuerySingleAsync<ScheduleViewModel>(sql, param: new { schedule.EmployeeId, schedule.Date, schedule.Duration, schedule.UserId });
      return result;
    }

    public async Task<bool> VerifyScheduleConflict(int employeeId, DateTime date, int duration)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT COUNT(*) 
                           FROM schedules 
                           WHERE employeeid = @EmployeeId 
                             AND date < @EndDate 
                             AND (date + (duration || ' minutes')::interval) > @StartDate;";

      var endDate = date.AddMinutes(duration);
      var count = await conn.ExecuteScalarAsync<int>(sql, new { EmployeeId = employeeId, StartDate = date, EndDate = endDate });
      return count > 0;
    }

    public async Task<IEnumerable<ScheduleViewModel>> GetSchedulesByEmployeeId(int? employeeId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      const string sql = @"SELECT id, employeeid AS EmployeeId, date AS Date, duration AS Duration, userid AS UserId
                           FROM schedules
                           WHERE employeeid = @EmployeeId
                             AND date >= NOW()
                           ORDER BY date;";

      var result = await conn.QueryAsync<ScheduleViewModel>(sql, new { EmployeeId = employeeId });
      return result;
    }

    public async Task<IEnumerable<ReportViewModel>> GetSchedulesReport(ReportQueryModel query, int UserId)
    {
      using NpgsqlConnection conn = new(_connectionString);

      string sql = $@"SELECT COUNT(*) AS quantity, TO_CHAR(date, @DateFormat) as datetime, {query.GetGroupByColumn()} AS label
                             FROM schedules s
                             JOIN employees e 
                               ON s.employeeid = e.id
                             JOIN shops sp 
                               ON e.shopid = sp.id
                            WHERE s.date >= NOW() - INTERVAL '{query.GetDateInterval()} day'
                              AND sp.owner_id = @UserId
                            GROUP BY datetime, label
                            ORDER BY datetime;";

      var result = await conn.QueryAsync<ReportViewModel>(sql, new { UserId, DateFormat = query.GetDateFormat() });
      return result;
    }
  }
}