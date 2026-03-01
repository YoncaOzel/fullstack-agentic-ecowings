using CleanArchitecture.Core.Settings;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;

namespace CleanArchitecture.Core.Interfaces
{
    public interface IPaymentService
    {
        string CreateCheckoutSession(int ticketId,decimal price, string successUrl, string cancelUrl);
    }
}
