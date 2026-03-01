using CleanArchitecture.Core.Features.Tickets.Commands.CreateTicket;
using CleanArchitecture.Core.Features.Tickets.Commands.DeleteTicket;
using CleanArchitecture.Core.Features.Tickets.Commands.UpdateTicket;
using CleanArchitecture.Core.Features.Tickets.Commands.CreateTicketWithCoupon;
using CleanArchitecture.Core.Features.Tickets.Queries.GetAllTickets;
using CleanArchitecture.Core.Features.Tickets.Queries.GetTicketById;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using CleanArchitecture.Core.Features.Tickets.Queries.GetUserFlights;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity; 
using CleanArchitecture.Infrastructure.Models; 
using CleanArchitecture.Core.Features.Users.Queries.GetAllUsers; 
using System.Linq; 
using System.Collections.Generic;

namespace CleanArchitecture.WebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class TicketController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly UserManager<ApplicationUser> _userManager; 

        public TicketController(IMediator mediator, UserManager<ApplicationUser> userManager)
        {
            _mediator = mediator;
            _userManager = userManager;
        }


        [HttpGet("all")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> GetAll()
        {
            var tickets = await _mediator.Send(new GetAllTicketsQuery());
            return Ok(tickets);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var ticket = await _mediator.Send(new GetTicketByIdQuery { Id = id });
            return Ok(ticket);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Update(int id, UpdateTicketCommand command)
        {
            if (id != command.Id) return BadRequest("Route ID and body ID must match.");
            var updatedTicketId = await _mediator.Send(command);
            return Ok(updatedTicketId);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deletedTicketId = await _mediator.Send(new DeleteTicketCommand { Id = id });
            return Ok(deletedTicketId);
        }


        [HttpPost]
        public async Task<IActionResult> Create(CreateTicketCommand command)
        {
            var ticketId = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id = ticketId }, ticketId);
        }

        [HttpPost("with-coupon")]
        public async Task<IActionResult> ApplyCouponToTicket([FromBody] CreateTicketWithCouponCommand command)
        {
            var result = await _mediator.Send(command);
            return Ok(result);
        }

        // 🚀 DÜZELTİLEN METOT: Uçuşlarım (GetMyFlights)
        [HttpGet("my-flights")]
        public async Task<IActionResult> GetMyFlights()
        {
            // 1. Identity'den giriş yapan kullanıcıyı bul
            var userIdString = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            var appUser = await _userManager.FindByIdAsync(userIdString);

            if (appUser == null) return Unauthorized("Geçersiz kullanıcı kimliği.");

            // 2. E-posta adresi üzerinden senin kendi "User" tablosundaki 'int' değerli kullanıcıyı bul
            var allUsers = await _mediator.Send(new GetAllUsersQuery());
            var customUser = allUsers.FirstOrDefault(u => u.Email == appUser.Email);

            // Eğer özel User tablosunda o email yoksa henüz hiç uçuşu/bileti de yoktur (Boş liste döneriz)
            if (customUser == null)
            {
                return Ok(new object[] { }); // Boş Dizi (Array) döner
            }

            // 3. Bulduğumuz 'int' ID'yi (customUser.Id) kullanarak uçuşları sorunsuzca getir!
            var result = await _mediator.Send(new GetUserFlightsQuery(customUser.Id));
            return Ok(result);
        }
    }
}