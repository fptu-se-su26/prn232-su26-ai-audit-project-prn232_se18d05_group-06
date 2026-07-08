using System;

namespace BACKEND.Models;

public partial class AiModelTrainingLog
{
    public int TrainingLogId { get; set; }

    public string ModelName { get; set; } = null!;

    public string ModelVersion { get; set; } = null!;

    public DateTime TrainingDate { get; set; }

    public DateTime? DataFrom { get; set; }

    public DateTime? DataTo { get; set; }

    public decimal? AccuracyScore { get; set; }

    public string Status { get; set; } = null!;

    public string? ErrorMessage { get; set; }

    public int? TriggeredBy { get; set; }

    public string TriggerType { get; set; } = null!;

    public virtual User? TriggeredByNavigation { get; set; }
}
