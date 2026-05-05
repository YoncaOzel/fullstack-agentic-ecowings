using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading.Tasks;
using System.Threading;

namespace CleanArchitecture.Core.Features.Coupons.Commands.UpdateCoupon
{
    public class UpdateCouponCommand : IRequest<int>
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public decimal DiscountRate { get; set; }
        public int SenderUserId { get; set; }
        public int ReceiverUserId { get; set; }
        public DateTime ExpiryDate { get; set; }
        public class UpdateCouponCommandHandler : IRequestHandler<UpdateCouponCommand, int>
        {
            private readonly IGenericRepositoryAsync<Coupon> _couponRepository;

            public UpdateCouponCommandHandler(IGenericRepositoryAsync<Coupon> couponRepository)
            {
                _couponRepository = couponRepository;
            }

            public async Task<int> Handle(UpdateCouponCommand request, CancellationToken cancellationToken)
            {
                var coupon = await _couponRepository.GetByIdAsync(request.Id);
                if (coupon == null)
                    throw new NotFoundException($"Coupon with id {request.Id} not found.");

                coupon.Code = request.Code;
                coupon.DiscountRate = request.DiscountRate;
                coupon.SenderUserId = request.SenderUserId;
                coupon.ReceiverUserId = request.ReceiverUserId;
                coupon.ExpiryDate = request.ExpiryDate;

                await _couponRepository.UpdateAsync(coupon);
                return coupon.Id;
            }
        }
    }
}
