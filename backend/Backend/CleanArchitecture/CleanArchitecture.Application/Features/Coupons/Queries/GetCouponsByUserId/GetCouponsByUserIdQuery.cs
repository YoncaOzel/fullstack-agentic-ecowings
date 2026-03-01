using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CleanArchitecture.Core.Features.Coupons.Queries.GetCouponsByUserId
{
    public class GetCouponsByUserIdQuery : IRequest<List<Coupon>>
    {
        public int UserId { get; set; }

        public class GetCouponsByUserIdQueryHandler : IRequestHandler<GetCouponsByUserIdQuery, List<Coupon>>
        {
            private readonly IGenericRepositoryAsync<Coupon> _couponRepository;

            public GetCouponsByUserIdQueryHandler(IGenericRepositoryAsync<Coupon> couponRepository)
            {
                _couponRepository = couponRepository;
            }

            public async Task<List<Coupon>> Handle(GetCouponsByUserIdQuery request, CancellationToken cancellationToken)
            {
                // Tüm kuponları çekip sadece giriş yapan kullanıcının ID'sine ait olanları filtreliyoruz.
                // (Not: Eğer Coupon modelindeki değişkenin adı UserId değilse, PassengerId veya OwnerId gibi bir şeyse, aşağıdaki kısmı ona göre düzeltmelisin)
                var allCoupons = await _couponRepository.GetAllAsync();
                var userCoupons = allCoupons.Where(c => c.ReceiverUserId == request.UserId).ToList();
                return userCoupons;
            }
        }
    }
}