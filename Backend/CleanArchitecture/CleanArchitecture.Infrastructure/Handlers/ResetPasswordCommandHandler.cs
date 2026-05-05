using MediatR;
using CleanArchitecture.Core.Features.Auth.Commands.ResetPassword;
using CleanArchitecture.Infrastructure.Contexts;
using CleanArchitecture.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Handlers
{
    public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, bool>
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<ResetPasswordCommandHandler> _logger;

        public ResetPasswordCommandHandler(
            ApplicationDbContext dbContext,
            UserManager<ApplicationUser> userManager,
            ILogger<ResetPasswordCommandHandler> logger)
        {
            _dbContext   = dbContext;
            _userManager = userManager;
            _logger      = logger;
        }

        public async Task<bool> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            var hashedToken = ForgetPasswordCommandHandler.HashToken(request.Token);

            var tokenRecord = await _dbContext.PasswordResetTokens
                .FirstOrDefaultAsync(t => t.HashedToken == hashedToken, cancellationToken);

            if (tokenRecord == null)
            {
                _logger.LogWarning("Password reset attempted with an unknown token.");
                return false;
            }

            if (tokenRecord.IsUsed)
            {
                _logger.LogWarning(
                    "Password reset attempted with an already-used token. UserId={UserId}",
                    tokenRecord.UserId);
                return false;
            }

            if (DateTime.UtcNow > tokenRecord.ExpiryDate)
            {
                _logger.LogWarning(
                    "Password reset attempted with an expired token. UserId={UserId}, Expiry={Expiry}",
                    tokenRecord.UserId, tokenRecord.ExpiryDate);
                return false;
            }

            var user = await _userManager.FindByIdAsync(tokenRecord.UserId);
            if (user == null)
            {
                _logger.LogError(
                    "PasswordResetToken references a non-existent UserId={UserId}.",
                    tokenRecord.UserId);
                return false;
            }

            if (!string.Equals(user.Email, request.Email, StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning(
                    "Email mismatch during password reset. Provided={Provided}, Expected={Expected}",
                    request.Email, user.Email);
                return false;
            }

            var identityResetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, identityResetToken, request.NewPassword);

            if (!result.Succeeded)
            {
                foreach (var error in result.Errors)
                {
                    _logger.LogWarning(
                        "Password reset error: {Code} – {Description}",
                        error.Code, error.Description);
                }
                return false;
            }

            tokenRecord.IsUsed = true;
            _dbContext.PasswordResetTokens.Update(tokenRecord);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Password successfully reset for UserId={UserId}.",
                tokenRecord.UserId);

            return true;
        }
    }
}
