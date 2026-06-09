using System.ComponentModel.DataAnnotations;

namespace SmartROIApi.Models;

public class CalculateRequest
{
    [Required]
    public string BusinessType { get; set; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "numberOfOutlets must be at least 1")]
    public int NumberOfOutlets { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "dailyTransactions must be at least 1")]
    public int DailyTransactions { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "transactionValue must be greater than 0")]
    public decimal TransactionValue { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "currentCost must be 0 or greater")]
    public decimal CurrentCost { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "staffCount must be at least 1")]
    public int StaffCount { get; set; }

    [Range(0.5, 24, ErrorMessage = "hoursPerDay must be between 0.5 and 24")]
    public decimal HoursPerDay { get; set; }
}
