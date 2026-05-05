using System.Threading.Tasks;
using System.Threading;
using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;

namespace CleanArchitecture.Core.Features.Coupons.Queries.GetCouponById
{
    public class GetCouponByIdQuery : IRequest<Coupon>
    {
        public int Id { get; set; }
        public class GetCouponByIdQueryHandler : IRequestHandler<GetCouponByIdQuery, Coupon>
        {
            private readonly IGenericRepositoryAsync<Coupon> _couponRepository;

            public GetCouponByIdQueryHandler(IGenericRepositoryAsync<Coupon> couponRepository)
            {
                _couponRepository = couponRepository;
            }

            public async Task<Coupon> Handle(GetCouponByIdQuery request, CancellationToken cancellationToken)
            {
                var coupon = await _couponRepository.GetByIdAsync(request.Id);
                if (coupon == null)
                    throw new NotFoundException($"Coupon with id {request.Id} not found.");

                return coupon;
            }
        }
    }
}
