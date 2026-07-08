using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services;

public class FinanceReportService : IFinanceReportService
{
    private static readonly string[] RecognizedStatuses = ["PAID", "PARTIAL", "PENDING"];
    private readonly SmartLogAiContext _context;

    public FinanceReportService(SmartLogAiContext context)
    {
        _context = context;
    }

    public async Task<RevenueByServiceDto> GetRevenueByServiceAsync(DateOnly? fromDate, DateOnly? toDate, string? status, CancellationToken cancellationToken = default)
    {
        var (resolvedFrom, resolvedTo) = ResolveDateRange(fromDate, toDate);
        var normalizedStatus = string.IsNullOrWhiteSpace(status) ? "ALL" : status.Trim().ToUpperInvariant();
        var allowedStatuses = normalizedStatus == "ALL" ? RecognizedStatuses : [normalizedStatus];

        var rows = await _context.ServiceCharges
            .AsNoTracking()
            .Where(charge => charge.IsApproved == true && charge.InvoiceId != null)
            .Join(
                _context.Invoices.AsNoTracking(),
                charge => charge.InvoiceId!.Value,
                invoice => invoice.InvoiceId,
                (charge, invoice) => new { charge, invoice })
            .Where(row => row.invoice.IssueDate >= resolvedFrom && row.invoice.IssueDate <= resolvedTo)
            .Where(row => row.invoice.Status != null && allowedStatuses.Contains(row.invoice.Status.ToUpper()))
            .GroupBy(row => row.charge.ChargeType)
            .Select(group => new
            {
                ChargeType = group.Key,
                TotalAmount = group.Sum(row => row.charge.Amount),
                CollectedAmount = group.Where(row => row.invoice.Status != null && row.invoice.Status.ToUpper() == "PAID").Sum(row => row.charge.Amount),
                InvoiceCount = group.Select(row => row.invoice.InvoiceId).Distinct().Count()
            })
            .OrderByDescending(item => item.TotalAmount)
            .ToListAsync(cancellationToken);

        var totalRevenue = rows.Sum(item => item.TotalAmount);
        var collectedRevenue = rows.Sum(item => item.CollectedAmount);
        var items = rows.Select(item => new RevenueByServiceItemDto
        {
            ChargeType = item.ChargeType,
            TotalAmount = item.TotalAmount,
            CollectedAmount = item.CollectedAmount,
            InvoiceCount = item.InvoiceCount,
            Percentage = CalculateMargin(item.TotalAmount, totalRevenue)
        }).ToList();

        return new RevenueByServiceDto
        {
            TotalRevenue = totalRevenue,
            CollectedRevenue = collectedRevenue,
            TopServiceType = items.FirstOrDefault()?.ChargeType ?? "N/A",
            FromDate = resolvedFrom,
            ToDate = resolvedTo,
            Status = normalizedStatus,
            Items = items
        };
    }

    public async Task<OperatingExpenseReportDto> GetOperatingExpensesAsync(DateOnly? fromDate, DateOnly? toDate, string? category, CancellationToken cancellationToken = default)
    {
        var (resolvedFrom, resolvedTo) = ResolveDateRange(fromDate, toDate);
        var normalizedCategory = string.IsNullOrWhiteSpace(category) ? "ALL" : category.Trim().ToUpperInvariant();
        var expenseRows = await LoadExpenseRowsAsync(resolvedFrom, resolvedTo, cancellationToken);

        if (normalizedCategory != "ALL")
        {
            expenseRows = expenseRows
                .Where(row => string.Equals(row.Category, normalizedCategory, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        var grouped = expenseRows
            .GroupBy(row => NormalizeExpenseCategory(row.Category))
            .Select(group => new
            {
                Category = group.Key,
                TotalAmount = group.Sum(row => row.Amount),
                EntryCount = group.Count()
            })
            .OrderByDescending(item => item.TotalAmount)
            .ToList();

        var totalExpense = grouped.Sum(item => item.TotalAmount);
        var items = grouped.Select(item => new OperatingExpenseItemDto
        {
            Category = item.Category,
            TotalAmount = item.TotalAmount,
            EntryCount = item.EntryCount,
            Percentage = CalculateMargin(item.TotalAmount, totalExpense)
        }).ToList();

        return new OperatingExpenseReportDto
        {
            TotalExpense = totalExpense,
            TopExpenseCategory = items.FirstOrDefault()?.Category ?? "N/A",
            FromDate = resolvedFrom,
            ToDate = resolvedTo,
            Category = normalizedCategory,
            Items = items
        };
    }

    public async Task<ProfitReportDto> GetProfitReportAsync(DateOnly? fromDate, DateOnly? toDate, string? period, CancellationToken cancellationToken = default)
    {
        var (resolvedFrom, resolvedTo) = ResolveDateRange(fromDate, toDate);
        var normalizedPeriod = NormalizePeriod(period);

        var revenueRows = await _context.Invoices
            .AsNoTracking()
            .Where(invoice => invoice.IssueDate >= resolvedFrom && invoice.IssueDate <= resolvedTo)
            .Where(invoice => invoice.Status != null && RecognizedStatuses.Contains(invoice.Status.ToUpper()))
            .Select(invoice => new PeriodAmountRow
            {
                Date = invoice.IssueDate,
                Amount = invoice.SubTotal - (invoice.DiscountAmt ?? 0)
            })
            .ToListAsync(cancellationToken);

        var expenseRows = await LoadExpenseRowsAsync(resolvedFrom, resolvedTo, cancellationToken);

        var revenueByPeriod = revenueRows
            .GroupBy(row => BuildPeriodKey(row.Date, normalizedPeriod))
            .ToDictionary(group => group.Key, group => group.Sum(row => row.Amount));

        var expenseByPeriod = expenseRows
            .GroupBy(row => BuildPeriodKey(row.Date, normalizedPeriod))
            .ToDictionary(group => group.Key, group => group.Sum(row => row.Amount));

        var periodKeys = EnumeratePeriodKeys(resolvedFrom, resolvedTo, normalizedPeriod)
            .Union(revenueByPeriod.Keys)
            .Union(expenseByPeriod.Keys)
            .OrderBy(key => key)
            .ToList();

        var items = periodKeys.Select(key =>
        {
            var revenue = revenueByPeriod.GetValueOrDefault(key, 0);
            var expense = expenseByPeriod.GetValueOrDefault(key, 0);
            var profit = revenue - expense;
            return new ProfitReportItemDto
            {
                Period = key,
                Revenue = revenue,
                Expense = expense,
                Profit = profit,
                ProfitMargin = CalculateMargin(profit, revenue)
            };
        }).ToList();

        var totalRevenue = items.Sum(item => item.Revenue);
        var totalExpense = items.Sum(item => item.Expense);
        var totalProfit = totalRevenue - totalExpense;

        return new ProfitReportDto
        {
            TotalRevenue = totalRevenue,
            TotalExpense = totalExpense,
            TotalProfit = totalProfit,
            ProfitMargin = CalculateMargin(totalProfit, totalRevenue),
            FromDate = resolvedFrom,
            ToDate = resolvedTo,
            Period = normalizedPeriod,
            Items = items
        };
    }

    private async Task<List<ExpenseAggregationRow>> LoadExpenseRowsAsync(DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken)
    {
        var expenseRows = new List<ExpenseAggregationRow>();

        try
        {
            var operatingRows = await _context.OperatingExpenses
                .AsNoTracking()
                .Where(expense => expense.Status == null || expense.Status.ToUpper() == "APPROVED")
                .Where(expense => expense.ExpenseDate >= fromDate && expense.ExpenseDate <= toDate)
                .Select(expense => new ExpenseAggregationRow
                {
                    Date = expense.ExpenseDate,
                    Category = expense.ExpenseCategory,
                    Amount = expense.Amount
                })
                .ToListAsync(cancellationToken);
            expenseRows.AddRange(operatingRows);
        }
        catch (Exception ex) when (IsMissingOperatingExpensesTable(ex))
        {
            // Older local databases may not have OperatingExpenses yet; keep reports usable from existing tables.
        }

        var exceptionRows = await _context.ExceptionExpenses
            .AsNoTracking()
            .Where(expense => expense.Status != null && expense.Status.ToUpper() == "APPROVED")
            .Where(expense => expense.ExpenseDate != null && expense.ExpenseDate >= fromDate && expense.ExpenseDate <= toDate)
            .Select(expense => new ExpenseAggregationRow
            {
                Date = expense.ExpenseDate!.Value,
                Category = "OTHER",
                Amount = expense.Amount
            })
            .ToListAsync(cancellationToken);
        expenseRows.AddRange(exceptionRows);

        var maintenanceRows = await _context.VehicleMaintenanceLogs
            .AsNoTracking()
            .Where(log => log.ServiceDate >= fromDate && log.ServiceDate <= toDate)
            .Where(log => log.CostAmount != null && log.CostAmount > 0)
            .Select(log => new ExpenseAggregationRow
            {
                Date = log.ServiceDate,
                Category = "MAINTENANCE",
                Amount = log.CostAmount ?? 0
            })
            .ToListAsync(cancellationToken);
        expenseRows.AddRange(maintenanceRows);

        return expenseRows;
    }

    private static (DateOnly From, DateOnly To) ResolveDateRange(DateOnly? fromDate, DateOnly? toDate)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var resolvedTo = toDate ?? today;
        var resolvedFrom = fromDate ?? resolvedTo.AddMonths(-2);
        if (resolvedFrom > resolvedTo)
        {
            (resolvedFrom, resolvedTo) = (resolvedTo, resolvedFrom);
        }

        return (resolvedFrom, resolvedTo);
    }

    private static string NormalizeExpenseCategory(string? category)
    {
        if (string.IsNullOrWhiteSpace(category)) return "OTHER";
        return category.Trim().ToUpperInvariant();
    }

    private static string NormalizePeriod(string? period)
    {
        var normalized = string.IsNullOrWhiteSpace(period) ? "month" : period.Trim().ToLowerInvariant();
        return normalized is "day" or "month" or "quarter" or "year" ? normalized : "month";
    }

    private static string BuildPeriodKey(DateOnly date, string period)
    {
        return period switch
        {
            "day" => date.ToString("yyyy-MM-dd"),
            "year" => date.ToString("yyyy"),
            "quarter" => $"{date.Year}-Q{((date.Month - 1) / 3) + 1}",
            _ => date.ToString("yyyy-MM")
        };
    }

    private static IEnumerable<string> EnumeratePeriodKeys(DateOnly fromDate, DateOnly toDate, string period)
    {
        var cursor = period switch
        {
            "day" => fromDate,
            "year" => new DateOnly(fromDate.Year, 1, 1),
            "quarter" => new DateOnly(fromDate.Year, (((fromDate.Month - 1) / 3) * 3) + 1, 1),
            _ => new DateOnly(fromDate.Year, fromDate.Month, 1)
        };

        while (cursor <= toDate)
        {
            yield return BuildPeriodKey(cursor, period);
            cursor = period switch
            {
                "day" => cursor.AddDays(1),
                "year" => cursor.AddYears(1),
                "quarter" => cursor.AddMonths(3),
                _ => cursor.AddMonths(1)
            };
        }
    }

    private static decimal CalculateMargin(decimal numerator, decimal denominator)
    {
        return denominator == 0 ? 0 : Math.Round(numerator / denominator * 100, 2);
    }

    private static bool IsMissingOperatingExpensesTable(Exception ex)
    {
        return ex.Message.Contains("OperatingExpenses", StringComparison.OrdinalIgnoreCase)
            || ex.InnerException?.Message.Contains("OperatingExpenses", StringComparison.OrdinalIgnoreCase) == true;
    }

    private sealed class PeriodAmountRow
    {
        public DateOnly Date { get; set; }
        public decimal Amount { get; set; }
    }

    private sealed class ExpenseAggregationRow
    {
        public DateOnly Date { get; set; }
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }
}