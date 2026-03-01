using System.Threading.Tasks;

namespace CleanArchitecture.Core.Interfaces
{
    public interface IUserIdentityService
    {
        Task<UserIdentityDto> FindUserByEmailAsync(string email);
        Task<string> GenerateEmailConfirmationTokenAsync(string userId);
        Task<bool> ConfirmEmailAsync(string userId, string token);
        Task<string> GeneratePasswordResetTokenAsync(string userId);
        Task<bool> ResetPasswordAsync(string userId, string token, string newPassword);
    }

    public class UserIdentityDto
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
} 