using System.Threading.Tasks;
using BACKEND.Models;

namespace BACKEND.Services
{
    public interface IReconciliationService
    {
        Task<ReconciliationResult> ReconcileAsync(ReconciliationRequest request);
    }
}
