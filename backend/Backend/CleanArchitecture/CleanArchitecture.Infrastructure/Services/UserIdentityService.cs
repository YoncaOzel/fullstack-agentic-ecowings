using CleanArchitecture.Core.Interfaces;
using CleanArchitecture.Infrastructure.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.Infrastructure.Services
{
    public class UserIdentityService : IUserIdentityService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<UserIdentityService> _logger;

        public UserIdentityService(UserManager<ApplicationUser> userManager, ILogger<UserIdentityService> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        public async Task<UserIdentityDto> FindUserByEmailAsync(string email)
        {
            try
            {
                _logger.LogInformation($"Finding user by email: {email}");
                var user = await _userManager.FindByEmailAsync(email);
                
                if (user == null)
                {
                    _logger.LogWarning($"User with email {email} not found");
                    return null;
                }

                _logger.LogInformation($"Found user with ID: {user.Id}");
                return new UserIdentityDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    UserName = user.UserName,
                    FirstName = user.FirstName,
                    LastName = user.LastName
                };
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error finding user by email {email}: {ex.Message}");
                throw;
            }
        }

        public async Task<string> GenerateEmailConfirmationTokenAsync(string userId)
        {
            try
            {
                _logger.LogInformation($"Generating email confirmation token for user ID: {userId}");
                var user = await _userManager.FindByIdAsync(userId);
                
                if (user == null)
                {
                    _logger.LogWarning($"User with ID {userId} not found while generating email confirmation token");
                    return null;
                }

                var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                _logger.LogInformation($"Email confirmation token generated for user ID: {userId}");
                return token;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating email confirmation token for user ID {userId}: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> ConfirmEmailAsync(string userId, string token)
        {
            try
            {
                _logger.LogInformation($"Confirming email for user ID: {userId}");
                var user = await _userManager.FindByIdAsync(userId);
                
                if (user == null)
                {
                    _logger.LogWarning($"User with ID {userId} not found while confirming email");
                    return false;
                }

                var result = await _userManager.ConfirmEmailAsync(user, token);
                if (result.Succeeded)
                {
                    _logger.LogInformation($"Email confirmed successfully for user ID: {userId}");
                }
                else
                {
                    _logger.LogWarning($"Failed to confirm email for user ID {userId}: {string.Join(", ", result.Errors)}");
                }
                
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error confirming email for user ID {userId}: {ex.Message}");
                throw;
            }
        }

        public async Task<string> GeneratePasswordResetTokenAsync(string userId)
        {
            try
            {
                _logger.LogInformation($"Generating password reset token for user ID: {userId}");
                var user = await _userManager.FindByIdAsync(userId);
                
                if (user == null)
                {
                    _logger.LogWarning($"User with ID {userId} not found while generating password reset token");
                    return null;
                }

                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                _logger.LogInformation($"Password reset token generated for user ID: {userId}");
                return token;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating password reset token for user ID {userId}: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> ResetPasswordAsync(string userId, string token, string newPassword)
        {
            try
            {
                _logger.LogInformation($"Resetting password for user ID: {userId}");
                var user = await _userManager.FindByIdAsync(userId);
                
                if (user == null)
                {
                    _logger.LogWarning($"User with ID {userId} not found while resetting password");
                    return false;
                }

                var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
                if (result.Succeeded)
                {
                    _logger.LogInformation($"Password reset successfully for user ID: {userId}");
                }
                else
                {
                    _logger.LogWarning($"Failed to reset password for user ID {userId}: {string.Join(", ", result.Errors)}");
                }
                
                return result.Succeeded;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error resetting password for user ID {userId}: {ex.Message}");
                throw;
            }
        }
    }
} 