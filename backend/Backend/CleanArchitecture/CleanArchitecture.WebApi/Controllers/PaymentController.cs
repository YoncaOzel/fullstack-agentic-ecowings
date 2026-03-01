using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Core.Settings;
using CleanArchitecture.Infrastructure.Contexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using Stripe.Events;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System;
using Microsoft.AspNetCore.Authorization;


namespace CleanArchitecture.WebApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly StripeSettings _settings;
        private readonly IPaymentService _paymentService;
        private readonly ApplicationDbContext _db;

        public PaymentController(
            IOptions<StripeSettings> settings,
            IPaymentService paymentService,
            ApplicationDbContext db)
        {
            _settings = settings.Value;
            _paymentService = paymentService;
            _db = db;
        }

        /// <summary>
        /// Creates a Stripe Checkout session and returns the payment page URL.
        /// </summary>
        [HttpPost("pay")]
        public IActionResult Pay([FromQuery] int ticketId, [FromQuery] decimal amount)
        {
            var successUrl = "http://localhost:3000/payment-success";
            var cancelUrl = "http://localhost:3000/payment-fail";

            var paymentUrl = _paymentService.CreateCheckoutSession(ticketId, amount, successUrl, cancelUrl);
            return Ok(new { paymentUrl });
        }

        /// <summary>
        /// Stripe webhook to listen for payment confirmation.
        /// </summary>
        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeSignature = Request.Headers["Stripe-Signature"];
            Event stripeEvent;
            if (string.IsNullOrEmpty(stripeSignature))
            {
                return BadRequest("Missing Stripe-Signature header.");
            }
            else { 
                

                try
                {
                    stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, _settings.WebhookSecret);
                }
                catch (StripeException e)
                {
                    return BadRequest($"Invalid signature: {e.Message}");
                }
            }

            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Session;
                var ticketIdStr = session?.Metadata?["ticketId"];

                if (int.TryParse(ticketIdStr, out int ticketId))
                {
                    var ticket = await _db.Tickets.AsTracking().FirstOrDefaultAsync(t => t.Id == ticketId);
                    if (ticket != null)
                    {
                        ticket.IsPaid = true;
                        ticket.PnrCode = GeneratePnrCode();
                        await _db.SaveChangesAsync();
                    }
                }
            }

            return Ok();
        }
        private string GeneratePnrCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 8)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

    }
}
