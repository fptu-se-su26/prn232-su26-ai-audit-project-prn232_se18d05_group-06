using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IFinanceDashboardService
    {
        Task<ProfitDashboardResponse> GetProfitSummaryAsync(ProfitDashboardQuery query);
    }
}
