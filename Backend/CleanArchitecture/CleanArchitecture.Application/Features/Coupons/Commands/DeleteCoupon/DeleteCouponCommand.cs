using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using System.Threading.Tasks;
using System.Threading;
using MediatR;

namespace CleanArchitecture.Core.Features.Coupons.Commands.DeleteCoupon
{
    public class DeleteCouponCommand : IRequest<int>
    {
        public int Id { get; set; }
        public class DeleteCouponCommandHandler : IRequestHandler<DeleteCouponCommand, int>
        {
            private readonly IGenericRepositoryAsync<Coupon> _couponRepository;

            public DeleteCouponCommandHandler(IGenericRepositoryAsync<Coupon> couponRepository)
            {
                _couponRepository = couponRepository;
            }

            public async Task<int> Handle(DeleteCouponCommand request, CancellationToken cancellationToken)
            {
                var coupon = await _couponRepository.GetByIdAsync(request.Id);
                if (coupon == null)
                    throw new NotFoundException($"Coupon with id {request.Id} not found.");

                await _couponRepository.DeleteAsync(coupon);
                return coupon.Id;
            }
        }
    }
}
