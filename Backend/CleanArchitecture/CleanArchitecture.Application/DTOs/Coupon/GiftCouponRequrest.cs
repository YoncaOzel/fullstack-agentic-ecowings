using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.DTOs.Coupon
{
    public class GiftCouponRequest
    {
        public string SenderEmail { get; set; }
        public string ReceiverEmail { get; set; }
    }

}
