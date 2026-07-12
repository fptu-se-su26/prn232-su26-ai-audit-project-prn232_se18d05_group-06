using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BACKEND.DTOs;
using BACKEND.Services;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/finance/dashboard")]
    [Authorize(Roles = "ADMIN,WF")]
    public class FinanceDashboardController : ControllerBase
    {
        private readonly IFinanceDashboardService _financeDashboardService;

        public FinanceDashboardController(IFinanceDashboardService financeDashboardService)
        {
            _financeDashboardService = financeDashboardService;
        }

        /// <summary>
        /// Lấy báo cáo tổng quan về Doanh thu, Chi phí, Lợi nhuận
        /// </summary>
        [HttpGet("profit-summary")]
        public async Task<IActionResult> GetProfitSummary([FromQuery] ProfitDashboardQuery query)
        {
            try
            {
                var result = await _financeDashboardService.GetProfitSummaryAsync(query);
                return Ok(result);
            }
            catch (System.ArgumentException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
}
