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
using Microsoft.Extensions.Configuration;


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
        private readonly IConfiguration _configuration;

        public PaymentController(
            IOptions<StripeSettings> settings,
            IPaymentService paymentService,
            ApplicationDbContext db,
            IConfiguration configuration)
        {
            _settings = settings.Value;
            _paymentService = paymentService;
            _db = db;
            _configuration = configuration;
        }

        /// <summary>
        /// Creates a Stripe Checkout session and returns the payment page URL.
        /// </summary>
        [HttpPost("pay")]
        public IActionResult Pay([FromQuery] int ticketId, [FromQuery] decimal amount)
        {
            var frontendUrl = _configuration["FrontendURL"]?.TrimEnd('/') ?? "http://localhost:5173";
            var successUrl = $"{frontendUrl}/payment-success";
            var cancelUrl = $"{frontendUrl}/payment-fail";

            var ticket = _db.Tickets.FirstOrDefault(t => t.Id == ticketId);
            
            decimal amountToPay = amount;
            if (ticket != null)
            {
                if (ticket.IsDiscounted && ticket.DiscountedPrice.HasValue)
                {
                    amountToPay = ticket.DiscountedPrice.Value;
                }
                else if (amount <= 0) // Eğer client'tan mantıklı bir amount gelmediyse fallback yap
                {
                    amountToPay = ticket.Price;
                }
            }

            var paymentUrl = _paymentService.CreateCheckoutSession(ticketId, amountToPay, successUrl, cancelUrl);
            return Ok(new { paymentUrl });
        }

        /// <summary>
        /// Stripe webhook to listen for payment confirmation.
        /// </summary>
        [AllowAnonymous] // Webhook'lar için authorize olmamalı
        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeSignature = Request.Headers["Stripe-Signature"];
            Event stripeEvent;

            // Log webhook received
            Console.WriteLine($"[WEBHOOK] Received webhook. Signature present: {!string.IsNullOrEmpty(stripeSignature)}");

            if (string.IsNullOrEmpty(stripeSignature))
            {
                Console.WriteLine("[WEBHOOK ERROR] Missing Stripe-Signature header");
                return BadRequest("Missing Stripe-Signature header.");
            }

            try
            {
                stripeEvent = EventUtility.ConstructEvent(json, stripeSignature, _settings.WebhookSecret);
                Console.WriteLine($"[WEBHOOK] Event type: {stripeEvent.Type}");
            }
            catch (StripeException e)
            {
                Console.WriteLine($"[WEBHOOK ERROR] Invalid signature: {e.Message}");
                return BadRequest($"Invalid signature: {e.Message}");
            }

            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Session;
                var ticketIdStr = session?.Metadata?["ticketId"];

                Console.WriteLine($"[WEBHOOK] Processing checkout.session.completed. TicketId from metadata: {ticketIdStr}");

                if (int.TryParse(ticketIdStr, out int ticketId))
                {
                    var ticket = await _db.Tickets.AsTracking().FirstOrDefaultAsync(t => t.Id == ticketId);
                    if (ticket != null)
                    {
                        Console.WriteLine($"[WEBHOOK] Found ticket {ticketId}. Current IsPaid: {ticket.IsPaid}");

                        ticket.IsPaid = true;
                        ticket.PnrCode = GeneratePnrCode();

                        await _db.SaveChangesAsync();

                        Console.WriteLine($"[WEBHOOK SUCCESS] Ticket {ticketId} updated. IsPaid: true, PnrCode: {ticket.PnrCode}");
                    }
                    else
                    {
                        Console.WriteLine($"[WEBHOOK ERROR] Ticket {ticketId} not found in database");
                    }
                }
                else
                {
                    Console.WriteLine($"[WEBHOOK ERROR] Could not parse ticketId from metadata: {ticketIdStr}");
                }
            }
            else
            {
                Console.WriteLine($"[WEBHOOK] Ignoring event type: {stripeEvent.Type}");
            }

            return Ok();
        }
        /// <summary>
        /// Test endpoint to manually mark a ticket as paid (for debugging)
        /// </summary>
        [HttpPost("test-mark-paid/{ticketId}")]
        [Authorize]
        public async Task<IActionResult> TestMarkPaid(int ticketId)
        {
            var ticket = await _db.Tickets.AsTracking().FirstOrDefaultAsync(t => t.Id == ticketId);
            if (ticket == null)
            {
                return NotFound($"Ticket {ticketId} not found");
            }

            ticket.IsPaid = true;
            ticket.PnrCode = GeneratePnrCode();
            await _db.SaveChangesAsync();

            return Ok(new 
            { 
                message = "Ticket marked as paid successfully",
                ticketId = ticket.Id,
                isPaid = ticket.IsPaid,
                pnrCode = ticket.PnrCode
            });
        }

        /// <summary>
        /// Check ticket payment status
        /// </summary>
        [HttpGet("check-ticket/{ticketId}")]
        [Authorize]
        public async Task<IActionResult> CheckTicketStatus(int ticketId)
        {
            var ticket = await _db.Tickets
                .Include(t => t.Flight)
                .Include(t => t.Passenger)
                .FirstOrDefaultAsync(t => t.Id == ticketId);

            if (ticket == null)
            {
                return NotFound($"Ticket {ticketId} not found");
            }

            return Ok(new 
            {
                ticketId = ticket.Id,
                isPaid = ticket.IsPaid,
                pnrCode = ticket.PnrCode,
                price = ticket.Price,
                bookingDate = ticket.BookingDate,
                passengerId = ticket.PassengerId,
                flightNumber = ticket.Flight?.FlightNumber
            });
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
