using CleanArchitecture.Core.DTOs.Account;
using CleanArchitecture.Core.Features.Auth.Commands.ForgetPassword;
using CleanArchitecture.Core.Features.Auth.Commands.ResetPassword;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly CleanArchitecture.Core.Interfaces.IAccountService _accountService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IMediator mediator,
            CleanArchitecture.Core.Interfaces.IAccountService accountService,
            ILogger<AuthController> logger)
        {
            _mediator       = mediator;
            _accountService = accountService;
            _logger         = logger;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var origin = Request.Headers["origin"].FirstOrDefault() ?? "https://localhost:5000";
            var result = await _accountService.RegisterAsync(request, origin);
            return Ok(new { Message = result });
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(AuthenticationRequest request)
        {
            var ipAddress = GenerateIPAddress();
            var response  = await _accountService.AuthenticateAsync(request, ipAddress);
            return Ok(response);
        }

        [HttpGet("confirm-email")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string code)
        {
            var result = await _accountService.ConfirmEmailAsync(userId, code);
            return Ok(new { Message = result });
        }

        /// <summary>
        /// Initiates a password-reset flow. Always returns 202 Accepted (anti-enumeration).
        /// Rate-limited: 3 requests per IP per minute.
        /// </summary>
        [HttpPost("forgot-password")]
        [AllowAnonymous]
        [EnableRateLimiting("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest model)
        {
            _logger.LogInformation("Forgot-password request received for email: {Email}", model.Email);

            // Handler suppresses all user-existence signals internally — always returns true
            await _mediator.Send(new ForgetPasswordCommand { Email = model.Email });

            // Always 202 — never reveal whether the email is registered
            return Accepted(new
            {
                Message = "If an account with that email exists, a password reset link has been sent."
            });
        }

        /// <summary>
        /// Validates the reset token and sets a new password.
        /// </summary>
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest model)
        {
            var success = await _mediator.Send(new ResetPasswordCommand
            {
                Email       = model.Email,
                Token       = model.Token,
                NewPassword = model.NewPassword
            });

            if (!success)
            {
                return BadRequest(new
                {
                    Message = "The password reset link is invalid, has already been used, or has expired."
                });
            }

            return Ok(new { Message = "Your password has been reset successfully. You can now log in with your new password." });
        }

        private string GenerateIPAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];

            return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "127.0.0.1";
        }
    }
}