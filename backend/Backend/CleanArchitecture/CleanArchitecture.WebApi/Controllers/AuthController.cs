using CleanArchitecture.Core.DTOs.Account;
using CleanArchitecture.Core.DTOs.Email;
using CleanArchitecture.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AuthController : ControllerBase
    {
        private readonly IAccountService _accountService; // Mükemmel çalışan servisimiz
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;

        // Constructor güncellendi
        public AuthController(
            IAccountService accountService,
            IEmailService emailService,
            ILogger<AuthController> logger)
        {
            _accountService = accountService;
            _emailService = emailService;
            _logger = logger;
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
            var response = await _accountService.AuthenticateAsync(request, ipAddress);
            return Ok(response); // Token, Roller vs her şey bu response içinde dönecek
        }

        [HttpGet("confirm-email")]
        [AllowAnonymous]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string code)
        {
            var result = await _accountService.ConfirmEmailAsync(userId, code);
            return Ok(new { Message = result });
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest model)
        {
            try
            {
                _logger.LogInformation($"Processing forgot password request for email: {model.Email}");
                var origin = Request.Headers["origin"].FirstOrDefault() ?? "https://localhost:5000";
                var result = await _accountService.ForgotPassword(model, origin);
                return Ok(new { Message = "Password reset email sent successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error processing forgot password request: {ex.Message}");
                return StatusCode(500, new { Message = $"An error occurred: {ex.Message}" });
            }
        }

        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest model)
        {
            var result = await _accountService.ResetPassword(model);
            return Ok(new { Message = result });
        }

        // IP adresi yakalama metodu (Token güvenliği için)
        private string GenerateIPAddress()
        {
            if (Request.Headers.ContainsKey("X-Forwarded-For"))
                return Request.Headers["X-Forwarded-For"];
            else
                return HttpContext.Connection.RemoteIpAddress?.MapToIPv4().ToString() ?? "127.0.0.1";
        }
    }
}