namespace BarberShopApi.Domain.Models.Schedules
{
  public class ReportQueryModel
  {
    public enum TimeFrame
    {
      Week,
      Month,
      Months
    }
    public enum GroupBy
    {
      Shop,
      Employee
    }
    public TimeFrame? Frame { get; set; }
    public GroupBy? Group { get; set; }

    public string GetDateFormat()
    {
      return Frame switch
      {
        TimeFrame.Week => "DD/MM",
        TimeFrame.Month => "DD/MM",
        TimeFrame.Months => "Month",
        _ => "DD/MM"
      };
    }

    public string GetGroupByColumn()
    {
      return Group switch
      {
        GroupBy.Shop => "sp.name",
        GroupBy.Employee => "e.name",
        _ => "sp.name"
      };
    }

    public int GetDateInterval()
    {
      return Frame switch
      {
        TimeFrame.Week => 7,
        TimeFrame.Month => 30,
        TimeFrame.Months => 180,
        _ => 7
      };
    } 
  }
}