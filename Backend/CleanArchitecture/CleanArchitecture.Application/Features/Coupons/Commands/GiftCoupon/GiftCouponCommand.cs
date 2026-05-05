using MediatR;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Features.Coupons.Commands.GiftCoupon;
using CleanArchitecture.Core.Interfaces;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CleanArchitecture.Core.Interfaces.Repositories;

namespace CleanArchitecture.Core.Features.Coupons.Commands.GiftCoupon
{
    public class GiftCouponCommand : IRequest<string>
    {
        public string SenderEmail { get; set; }
        public string ReceiverEmail { get; set; }
    }

    public class GiftCouponCommandHandler : IRequestHandler<GiftCouponCommand, string>
    {
        private readonly IUserRepositoryAsync _userRepository;
        private readonly IGenericRepositoryAsync<Coupon> _couponRepository;

        public GiftCouponCommandHandler(IUserRepositoryAsync userRepository, IGenericRepositoryAsync<Coupon> couponRepository)
        {
            _userRepository = userRepository;
            _couponRepository = couponRepository;
        }

        public async Task<string> Handle(GiftCouponCommand request, CancellationToken cancellationToken)
        {
            var sender = await _userRepository.GetByEmailAsync(request.SenderEmail);
            var receiver = await _userRepository.GetByEmailAsync(request.ReceiverEmail);

            if (sender == null || receiver == null)
                throw new Exception("Sender or receiver not found.");

            string code = GenerateCouponCode();

            var coupon = new Coupon
            {
                Code = code,
                DiscountRate = 100,
                SenderUserId = sender.Id,
                ReceiverUserId = receiver.Id,
                ExpiryDate = DateTime.UtcNow.AddMonths(1),
                IsGift = true
            };

            await _couponRepository.AddAsync(coupon);

            return code;
        }

        private string GenerateCouponCode()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 10)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
