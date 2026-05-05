using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;

namespace CleanArchitecture.Core.Features.Coupons.Commands.CreateCoupon
{
    public class CreateCouponCommand : IRequest<string>
    {
        //public string Code { get; set; }
        public decimal DiscountRate { get; set; }
        //public int SenderUserId { get; set; }
        //public int ReceiverUserId { get; set; }
        public DateTime ExpiryDate { get; set; }
        public class CreateCouponCommandHandler : IRequestHandler<CreateCouponCommand, string>
        {
            private readonly IGenericRepositoryAsync<Coupon> _couponRepo;

            public CreateCouponCommandHandler(IGenericRepositoryAsync<Coupon> couponRepo)
            {
                _couponRepo = couponRepo;
            }

            public async Task<string> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
            {
                var code = GenerateUniqueCode();

                var coupon = new Coupon
                {
                    Code = code,
                    DiscountRate = request.DiscountRate,
                    ExpiryDate = request.ExpiryDate,
                    IsGift = false
                };

                await _couponRepo.AddAsync(coupon);
                return code;
            }

            private string GenerateUniqueCode()
            {
                var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                return new string(Enumerable.Repeat(chars, 10)
                    .Select(s => s[new Random().Next(s.Length)]).ToArray());
            }
        }

    }
}
