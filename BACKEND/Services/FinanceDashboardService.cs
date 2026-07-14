using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BACKEND.DTOs;
using BACKEND.Models;

namespace BACKEND.Services
{
    public class FinanceDashboardService : IFinanceDashboardService
    {
        private readonly SmartLogAiContext _context;

        public FinanceDashboardService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<ProfitDashboardResponse> GetProfitSummaryAsync(ProfitDashboardQuery query)
        {
            // Validate & set defaults
            DateTime fromDate = query.FromDate ?? new DateTime(DateTime.UtcNow.Year, 1, 1);
            DateTime toDate = query.ToDate ?? DateTime.UtcNow;
            if (fromDate > toDate)
            {
                throw new ArgumentException("FromDate cannot be greater than ToDate");
            }
            string periodType = (query.PeriodType ?? "month").ToLower();

            // Lấy danh sách invoice trong kỳ
            var validInvoiceStatuses = new[] { "PENDING", "PARTIAL", "PAID", "OVERDUE" };
            
            var invoices = await _context.Invoices
                .Where(i => i.IssueDate >= DateOnly.FromDateTime(fromDate) && i.IssueDate <= DateOnly.FromDateTime(toDate) 
                            && validInvoiceStatuses.Contains(i.Status))
                .ToListAsync();

            // Doanh thu hóa đơn
            decimal revenueInvoiced = invoices.Sum(i => i.TotalAmount ?? 0);

            // Số lượng invoice theo status
            int totalInvoices = invoices.Count;
            int paidInvoices = invoices.Count(i => i.Status == "PAID");
            int partialInvoices = invoices.Count(i => i.Status == "PARTIAL");
            int overdueInvoices = invoices.Count(i => i.Status == "OVERDUE");

            // Doanh thu thực thu
            var payments = await _context.Payments
                .Where(p => p.Status == "CONFIRMED" && p.PaidAt >= fromDate && p.PaidAt <= toDate)
                .ToListAsync();
            decimal revenueCollected = payments.Sum(p => p.Amount);

            // Chi phí vận hành
            var operatingExpenses = await _context.OperatingExpenses
                .Where(e => e.Status == "APPROVED" && e.ExpenseDate >= DateOnly.FromDateTime(fromDate) && e.ExpenseDate <= DateOnly.FromDateTime(toDate))
                .ToListAsync();
            decimal operatingCost = operatingExpenses.Sum(e => e.Amount);

            // Chi phí ngoại lệ
            var exceptionExpenses = await _context.ExceptionExpenses
                .Where(e => e.Status == "APPROVED" && e.ExpenseDate >= DateOnly.FromDateTime(fromDate) && e.ExpenseDate <= DateOnly.FromDateTime(toDate))
                .ToListAsync();
            decimal exceptionCost = exceptionExpenses.Sum(e => e.Amount);

            // Chi phí bảo trì
            var maintenanceLogs = await _context.VehicleMaintenanceLogs
                .Where(m => m.ServiceDate >= DateOnly.FromDateTime(fromDate) && m.ServiceDate <= DateOnly.FromDateTime(toDate))
                .ToListAsync();
            decimal maintenanceCost = maintenanceLogs.Sum(m => m.CostAmount ?? 0);

            decimal totalExpense = operatingCost + exceptionCost + maintenanceCost;

            // Số đơn hàng
            var totalOrders = await _context.ServiceOrders
                .Where(o => o.CreatedAt >= fromDate && o.CreatedAt <= toDate)
                .CountAsync();

            // Lợi nhuận & Biên lợi nhuận
            decimal profitByInvoice = revenueInvoiced - totalExpense;
            decimal profitByCollected = revenueCollected - totalExpense;

            decimal profitMarginByInvoice = revenueInvoiced == 0 ? 0 : Math.Round((profitByInvoice / revenueInvoiced) * 100, 2);
            decimal profitMarginByCollected = revenueCollected == 0 ? 0 : Math.Round((profitByCollected / revenueCollected) * 100, 2);

            // Expense Breakdown
            var expenseBreakdown = new List<ExpenseBreakdownDto>
            {
                new ExpenseBreakdownDto { Category = "Operating", Amount = operatingCost },
                new ExpenseBreakdownDto { Category = "Exception", Amount = exceptionCost },
                new ExpenseBreakdownDto { Category = "Maintenance", Amount = maintenanceCost }
            };

            // Service Revenue Breakdown
            var serviceCharges = await _context.ServiceCharges
                .Where(s => s.IsApproved == true && s.CreatedAt >= fromDate && s.CreatedAt <= toDate)
                .GroupBy(s => s.ChargeType)
                .Select(g => new ServiceRevenueBreakdownDto
                {
                    ServiceType = g.Key ?? "UNKNOWN",
                    Amount = g.Sum(s => s.Amount)
                })
                .ToListAsync();

            // Chart Data
            var chartData = BuildChartData(invoices, payments, operatingExpenses, exceptionExpenses, maintenanceLogs, fromDate, toDate, periodType);

            return new ProfitDashboardResponse
            {
                Success = true,
                PeriodType = periodType,
                FromDate = fromDate.ToString("yyyy-MM-dd"),
                ToDate = toDate.ToString("yyyy-MM-dd"),
                Summary = new ProfitSummaryDto
                {
                    RevenueInvoiced = revenueInvoiced,
                    RevenueCollected = revenueCollected,
                    OperatingCost = operatingCost,
                    ExceptionCost = exceptionCost,
                    MaintenanceCost = maintenanceCost,
                    TotalExpense = totalExpense,
                    ProfitByInvoice = profitByInvoice,
                    ProfitByCollected = profitByCollected,
                    ProfitMarginByInvoice = profitMarginByInvoice,
                    ProfitMarginByCollected = profitMarginByCollected,
                    TotalOrders = totalOrders,
                    TotalInvoices = totalInvoices,
                    PaidInvoices = paidInvoices,
                    PartialInvoices = partialInvoices,
                    OverdueInvoices = overdueInvoices
                },
                ExpenseBreakdown = expenseBreakdown,
                ServiceRevenueBreakdown = serviceCharges,
                ChartData = chartData
            };
        }

        private List<ProfitChartPointDto> BuildChartData(
            List<Invoice> invoices,
            List<Payment> payments,
            List<OperatingExpense> operatingExpenses,
            List<ExceptionExpense> exceptionExpenses,
            List<VehicleMaintenanceLog> maintenanceLogs,
            DateTime fromDate,
            DateTime toDate,
            string periodType)
        {
            var dict = new Dictionary<string, ProfitChartPointDto>();

            // Khởi tạo các mốc thời gian tùy theo periodType
            DateTime current = fromDate;
            while (current <= toDate)
            {
                string key = GetPeriodKey(current, periodType);
                if (!dict.ContainsKey(key))
                {
                    dict[key] = new ProfitChartPointDto { Period = key };
                }
                
                current = periodType switch
                {
                    "day" => current.AddDays(1),
                    "month" => current.AddMonths(1),
                    "quarter" => current.AddMonths(3),
                    "year" => current.AddYears(1),
                    _ => current.AddMonths(1)
                };
            }

            foreach (var inv in invoices)
            {
                string key = GetPeriodKey(inv.IssueDate.ToDateTime(TimeOnly.MinValue), periodType);
                if (dict.ContainsKey(key))
                {
                    dict[key].RevenueInvoiced += (inv.TotalAmount ?? 0);
                }
            }

            foreach (var pay in payments)
            {
                if (pay.PaidAt == null) continue;
                string key = GetPeriodKey(pay.PaidAt.Value, periodType);
                if (dict.ContainsKey(key))
                {
                    dict[key].RevenueCollected += pay.Amount;
                }
            }

            foreach (var op in operatingExpenses)
            {
                string key = GetPeriodKey(op.ExpenseDate.ToDateTime(TimeOnly.MinValue), periodType);
                if (dict.ContainsKey(key))
                {
                    dict[key].TotalExpense += op.Amount;
                }
            }

            foreach (var ex in exceptionExpenses)
            {
                if (ex.ExpenseDate == null) continue;
                string key = GetPeriodKey(ex.ExpenseDate.Value.ToDateTime(TimeOnly.MinValue), periodType);
                if (dict.ContainsKey(key))
                {
                    dict[key].TotalExpense += ex.Amount;
                }
            }

            foreach (var mt in maintenanceLogs)
            {
                string key = GetPeriodKey(mt.ServiceDate.ToDateTime(TimeOnly.MinValue), periodType);
                if (dict.ContainsKey(key))
                {
                    dict[key].TotalExpense += (mt.CostAmount ?? 0);
                }
            }

            foreach (var pt in dict.Values)
            {
                pt.ProfitByInvoice = pt.RevenueInvoiced - pt.TotalExpense;
                pt.ProfitByCollected = pt.RevenueCollected - pt.TotalExpense;
            }

            return dict.Values.OrderBy(x => x.Period).ToList();
        }

        private string GetPeriodKey(DateTime date, string periodType)
        {
            return periodType switch
            {
                "day" => date.ToString("yyyy-MM-dd"),
                "month" => date.ToString("yyyy-MM"),
                "quarter" => $"{date.Year}-Q{((date.Month - 1) / 3) + 1}",
                "year" => date.Year.ToString(),
                _ => date.ToString("yyyy-MM")
            };
        }
    }
}
