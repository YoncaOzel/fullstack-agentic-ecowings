using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Exceptions;
using CleanArchitecture.Core.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using System.Collections.Generic;
using CleanArchitecture.Core.DTOs.Coupon;

namespace CleanArchitecture.Core.Features.Tickets.Commands.CreateTicketWithCoupon
{
    public class CreateTicketWithCouponCommand : IRequest<CouponAppliedResultDto>
    {
        public int TicketId { get; set; }
        public string CouponCode { get; set; }

        public class CreateTicketWithCouponHandler : IRequestHandler<CreateTicketWithCouponCommand, CouponAppliedResultDto>
        {
            private readonly IGenericRepositoryAsync<Ticket> _ticketRepo;
            private readonly IGenericRepositoryAsync<Coupon> _couponRepo;

            public CreateTicketWithCouponHandler(
                IGenericRepositoryAsync<Ticket> ticketRepo,
                IGenericRepositoryAsync<Coupon> couponRepo)
            {
                _ticketRepo = ticketRepo;
                _couponRepo = couponRepo;
            }

            public async Task<CouponAppliedResultDto> Handle(CreateTicketWithCouponCommand request, CancellationToken cancellationToken)
            {
                var ticket = await _ticketRepo.GetByIdAsync(request.TicketId);
                var coupon = (await _couponRepo.GetAllAsync())
                    .FirstOrDefault(c => c.Code == request.CouponCode && c.ExpiryDate > DateTime.UtcNow);

                if (ticket == null || coupon == null)
                    throw new Exception("Invalid ticket or coupon.");

                var originalPrice = ticket.Price;
                var discount = ticket.Price * (coupon.DiscountRate / 100);
                var discountedPrice = Math.Round(originalPrice - discount, 2);

                ticket.Price = discountedPrice;
                await _ticketRepo.UpdateAsync(ticket);

                return new CouponAppliedResultDto
                {
                    OriginalPrice = originalPrice,
                    DiscountedPrice = discountedPrice,
                    DiscountRate = coupon.DiscountRate
                };
            }
        }

    }
} 