using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using System.Linq;
using AutoMapper;

namespace CleanArchitecture.Core.Features.Coupons.Queries.GetAllCoupons
{
    public class GetAllCouponsQuery : IRequest<List<Coupon>>
    {
        public class GetAllCouponsQueryHandler : IRequestHandler<GetAllCouponsQuery, List<Coupon>>
        {
            private readonly IGenericRepositoryAsync<Coupon> _couponRepository;
            private readonly IMapper _mapper;
            public GetAllCouponsQueryHandler(IGenericRepositoryAsync<Coupon> couponRepository, IMapper mapper)
            {
                _couponRepository = couponRepository;
                _mapper = mapper;
            }

            public async Task<List<Coupon>> Handle(GetAllCouponsQuery request, CancellationToken cancellationToken)
            {
                var coupons = await _couponRepository.GetAllAsync();
                return coupons.Where(c => !c.IsGift).ToList();
            }
        }
    }
}
