using CleanArchitecture.Core.DTOs.Coupon;
using CleanArchitecture.Core.Features.Coupons.Commands.CreateCoupon;
using CleanArchitecture.Core.Features.Coupons.Commands.DeleteCoupon;
using CleanArchitecture.Core.Features.Coupons.Commands.GiftCoupon;
using CleanArchitecture.Core.Features.Coupons.Commands.UpdateCoupon;
using CleanArchitecture.Core.Features.Coupons.Queries.GetAllCoupons;
using CleanArchitecture.Core.Features.Coupons.Queries.GetCouponById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CleanArchitecture.WebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public class CouponController : ControllerBase
    {
        private readonly IMediator _mediator;

        public CouponController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // POST: api/coupon
        [HttpPost("create")]
        public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponCommand request)
        {
            var command = new CreateCouponCommand
            {
                DiscountRate = request.DiscountRate,
                ExpiryDate = request.ExpiryDate
            };

            var code = await _mediator.Send(command);
            return Ok(new { couponCode = code });
        }

        // GET: api/coupon
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var coupons = await _mediator.Send(new GetAllCouponsQuery());
            return Ok(coupons);
        }

        // GET: api/coupon/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var coupon = await _mediator.Send(new GetCouponByIdQuery { Id = id });
            return Ok(coupon);
        }

        // PUT: api/coupon/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateCouponCommand command)
        {
            if (id != command.Id)
                return BadRequest("Route ID and body ID must match.");

            var updatedCouponId = await _mediator.Send(command);
            return Ok(updatedCouponId);
        }

        // DELETE: api/coupon/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deletedCouponId = await _mediator.Send(new DeleteCouponCommand { Id = id });
            return Ok(deletedCouponId);
        }

        [HttpPost("gift")]
        public async Task<IActionResult> CreateGiftCoupon([FromBody] GiftCouponCommand command)
        {
            var couponCode = await _mediator.Send(command);
            return Ok(new { couponCode });
        }

    }
}
