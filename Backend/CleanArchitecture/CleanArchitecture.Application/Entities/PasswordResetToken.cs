using System;

namespace CleanArchitecture.Core.Entities
{
    public class PasswordResetToken
    {
        public int Id { get; set; }
        public string HashedToken { get; set; }
        public string UserId { get; set; }
        public DateTime ExpiryDate { get; set; }
        public bool IsUsed { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
