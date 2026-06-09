namespace SmartROIApi.Models;

public class CalculateResponse
{
    public decimal MonthlyRevenue { get; set; }
    public decimal ErrorSavings { get; set; }
    public decimal TimeSavings { get; set; }
    public decimal SmartouchCost { get; set; }
    public decimal NetSavings { get; set; }
    public decimal AnnualSavings { get; set; }
    public decimal Roi { get; set; }
    public decimal PaybackMonths { get; set; }
}
