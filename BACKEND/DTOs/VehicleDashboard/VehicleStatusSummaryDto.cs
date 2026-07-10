namespace BACKEND.DTOs.VehicleDashboard;

public class VehicleStatusSummaryDto
{
    public int Scheduled { get; set; }
    public int Waiting { get; set; }
    public int Unloading { get; set; }
    public int Loading { get; set; }
    public int Completed { get; set; }
    public int Departed { get; set; }
    public int Total => Scheduled + Waiting + Unloading + Loading + Completed + Departed;
}
