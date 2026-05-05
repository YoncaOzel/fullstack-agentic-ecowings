using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Settings;
using Microsoft.Extensions.Options;
using Stripe.Checkout;
using Stripe;

namespace CleanArchitecture.Infrastructure.Services
{
    public class StripePaymentService : IPaymentService
    {
        private readonly StripeSettings _settings;

        public StripePaymentService(IOptions<StripeSettings> options)
        {
            _settings = options.Value;
            StripeConfiguration.ApiKey = _settings.SecretKey;
        }

        public string CreateCheckoutSession(int ticketId, decimal price, string successUrl, string cancelUrl)
        {
            var options = new SessionCreateOptions
            {
                Metadata = new Dictionary<string, string> { { "ticketId", ticketId.ToString() } },
                
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>

            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "try",
                        UnitAmount = (long)(price * 100), // kuruş
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = "Flight Ticket"
                        }
                    },
                    Quantity = 1
                }
            },
                Mode = "payment",
                SuccessUrl = successUrl,
                CancelUrl = cancelUrl
            };

            var service = new SessionService();
            Session session = service.Create(options);
            return session.Url;
        }
    }

}
