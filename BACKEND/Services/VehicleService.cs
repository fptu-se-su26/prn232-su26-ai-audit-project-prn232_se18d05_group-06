using BACKEND.Models;
using BACKEND.DTOs;
using Microsoft.EntityFrameworkCore;
namespace BACKEND.Services;
public class VehicleService : IVehicleService {
    public VehicleService(SmartLogAiContext context) { }
    public Task<IEnumerable<VehicleDto>> GetAllVehiclesAsync() => Task.FromResult<IEnumerable<VehicleDto>>(new List<VehicleDto>());
    public Task<VehicleDto?> GetVehicleByIdAsync(int id) => Task.FromResult<VehicleDto?>(null);
    public Task<VehicleDto> AddVehicleAsync(VehicleDto vehicle) => Task.FromResult(vehicle);
    public Task UpdateVehicleAsync(int id, VehicleDto vehicle) => Task.CompletedTask;
    public Task DeleteVehicleAsync(int id) => Task.CompletedTask;
    public Task<VehicleDto> DetectStrangeVehicleAsync(string plate) => Task.FromResult<VehicleDto>(null!);
    public Task<List<VehicleDto>> GetPendingVehiclesAsync() => Task.FromResult<List<VehicleDto>>(new List<VehicleDto>());
    public Task<VehicleDto> ApproveVehicleAsync(int id, ApproveVehicleRequestDto request) => Task.FromResult<VehicleDto>(null!);
    public Task<bool> RejectVehicleAsync(int id) => Task.FromResult<bool>(true);
}
