using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IPaymentService
{
    Task<PaymentConfirmationDto> ConfirmPaymentAsync(ConfirmPaymentRequestDto request, int? confirmedBy = null, CancellationToken cancellationToken = default);
    Task<PaymentConfirmationDto> ConfirmExistingPaymentAsync(int paymentId, int? confirmedBy = null, bool sendEmail = true, CancellationToken cancellationToken = default);
}
