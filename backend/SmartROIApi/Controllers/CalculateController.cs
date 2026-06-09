using Microsoft.AspNetCore.Mvc;
using SmartROIApi.Models;

namespace SmartROIApi.Controllers;

[ApiController]
[Route("api")]
public class CalculateController : ControllerBase
{
    [HttpPost("calculate")]
    public IActionResult Calculate([FromBody] CalculateRequest req)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Monthly turnover across all outlets
        decimal monthlyRevenue = Round(req.DailyTransactions * req.TransactionValue * 30 * req.NumberOfOutlets);

        // 2% of revenue lost to manual errors, recovered by automation
        decimal errorSavings = Round(monthlyRevenue * 0.02m);

        // Hours of manual work replaced, costed at RM 25/hr
        decimal timeSavings = Round(req.HoursPerDay * req.StaffCount * 30 * 25m);

        // Smartouch subscription at RM 299 per outlet per month
        decimal smartouchCost = Round(req.NumberOfOutlets * 299m);

        // Net savings = what automation saves minus the net new software spend
        // (smartouchCost - currentCost) is the incremental software cost
        decimal netSavings = Round(errorSavings + timeSavings - (smartouchCost - req.CurrentCost));

        decimal annualSavings = Round(netSavings * 12);

        // ROI as a percentage of the annual Smartouch investment
        decimal roi = smartouchCost > 0
            ? Round((annualSavings / (smartouchCost * 12)) * 100)
            : 0m;

        // Months to recover the first month's subscription cost
        // -1 signals "never" when savings are zero or negative
        decimal paybackMonths = netSavings > 0
            ? Round(smartouchCost / netSavings)
            : -1m;

        return Ok(new CalculateResponse
        {
            MonthlyRevenue = monthlyRevenue,
            ErrorSavings   = errorSavings,
            TimeSavings    = timeSavings,
            SmartouchCost  = smartouchCost,
            NetSavings     = netSavings,
            AnnualSavings  = annualSavings,
            Roi            = roi,
            PaybackMonths  = paybackMonths,
        });
    }

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
