using System.Threading.Tasks;
using BACKEND.Models;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "ADMIN,WAREHOUSE,WF")]
    public class ReconciliationController : ControllerBase
    {
        private readonly IReconciliationService _service;

        public ReconciliationController(IReconciliationService service)
        {
            _service = service;
        }

        [HttpPost("compare")]
        public async Task<IActionResult> Compare([FromForm] ReconciliationRequest request)
        {
            if (request.ActualCountFile == null)
            {
                return BadRequest("ActualCountFile is required.");
            }

            var result = await _service.ReconcileAsync(request);

            Response.Headers.Append("X-Critical-Alerts-Count", result.CriticalDiffs.Count.ToString());
            Response.Headers.Append("Access-Control-Expose-Headers", "X-Critical-Alerts-Count");

            return File(result.ExcelReport, 
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        result.FileName);
        }
    }
}
