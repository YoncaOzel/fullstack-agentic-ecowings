using System;

namespace CleanArchitecture.Core.Entities
{
    public class Coupon
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public decimal DiscountRate { get; set; }

        // Foreign Key
        public int? SenderUserId { get; set; }
        public User SenderUser { get; set; }

        // Foreign Key
        public int? ReceiverUserId { get; set; }
        public User ReceiverUser { get; set; }

        public DateTime ExpiryDate { get; set; }

        public bool IsGift { get; set; } = false;
    }
}
