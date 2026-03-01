using CleanArchitecture.Core.Entities;
using CleanArchitecture.Core.Features.Coupons.Queries.GetCouponsByUserId;
using CleanArchitecture.Core.Features.Users.Commands.CreateUser;
using CleanArchitecture.Core.Features.Users.Commands.DeleteUser;
using CleanArchitecture.Core.Features.Users.Commands.UpdateUser;
using CleanArchitecture.Core.Features.Users.Queries.GetAllUsers;
using CleanArchitecture.Core.Features.Users.Queries.GetUserById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using CleanArchitecture.Core.DTOs.User;
using CleanArchitecture.Core.Features.Users.Commands.ChangeUserPassword;
using System.Linq;
using CleanArchitecture.Core.DTOs.User;
using System.Security.Claims; 
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using CleanArchitecture.Infrastructure.Models;

namespace CleanArchitecture.WebApi.Controllers
{
    [Authorize] 
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly UserManager<ApplicationUser> _userManager;

        public UserController(IMediator mediator, UserManager<ApplicationUser> userManager)
        {
            _mediator = mediator;
            _userManager = userManager;
        }


        // Sadece giriş yapan kullanıcının kendi profil bilgilerini getirir
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            // 1. Token'dan GUID formatındaki metin ID'yi (string) çekiyoruz
            var userIdString = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userIdString))
                return Unauthorized("Kullanıcı kimliği doğrulanamadı.");

            // 2. Sayıya (int) çevirmeye ÇALIŞMADAN, doğrudan Identity sisteminden buluyoruz!
            var user = await _userManager.FindByIdAsync(userIdString);

            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            // 3. Kullanıcı verilerini güvenli bir şekilde React'e gönderiyoruz
            return Ok(new
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserName = user.UserName
            });
        }

        // Giriş yapan kullanıcının kendi profilini güncellemesi
        [HttpPut("me")]
        public async Task<IActionResult> UpdateMe([FromBody] UpdateProfileDto dto)
        {
            // 1. Güvenlik: Token'dan giriş yapan kişiyi bul
            var userIdString = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            var appUser = await _userManager.FindByIdAsync(userIdString);

            if (appUser == null) return Unauthorized("Oturum süresi dolmuş veya geçersiz.");

            // 2. Asıl "User" veritabanı tablomuzdaki kişiyi bul
            var allUsers = await _mediator.Send(new GetAllUsersQuery());
            var customUser = allUsers.FirstOrDefault(u => u.Email == appUser.Email);

            if (customUser == null)
                return NotFound("Kullanıcı detayları veritabanında bulunamadı.");

            var updateUserCommand = new UpdateUserCommand
            {
                Id = customUser.Id,             
                Role = customUser.Role,         
                Email = customUser.Email,       
                FirstName = dto.FirstName,      
                LastName = dto.LastName,        
                PasswordPlain = dto.PasswordPlain,
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                PhoneNumber = dto.PhoneNumber
            };

            // 1. Asıl User Entity'sini güncelle (Senin kendi tablondaki veriler değişir)
            await _mediator.Send(updateUserCommand);

            // 2. Identity (Login) sistemini eş zamanlı güncelle
            appUser.FirstName = dto.FirstName;
            appUser.LastName = dto.LastName;

            var result = await _userManager.UpdateAsync(appUser);

            if (result.Succeeded)
                return Ok(new { Message = "Profil başarıyla güncellendi!" });
            else
                return BadRequest("Giriş bilgileri güncellenirken bir hata oluştu.");
        }



        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin")] // Sadece Admin manuel kullanıcı yaratabilir
        public async Task<IActionResult> Create(CreateUserCommand command)
        {
            var id = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetById), new { id }, id);
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin,Admin")] // Sadece Admin tüm kullanıcıları listeleyebilir
        public async Task<IActionResult> GetAll()
        {
            var users = await _mediator.Send(new GetAllUsersQuery());
            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")] // Sadece Admin istediği kişinin ID'sini yazıp tüm bilgilerini görebilir
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _mediator.Send(new GetUserByIdQuery { Id = id });
            return Ok(user);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")] // Sadece Admin başkasının verisini ID ile güncelleyebilir
        public async Task<IActionResult> Update(int id, UpdateUserCommand command)
        {
            if (id != command.Id) return BadRequest("Route ID and body ID must match.");
            var updatedId = await _mediator.Send(command);
            return Ok(updatedId);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")] // Sadece Admin kullanıcıları silebilir
        public async Task<IActionResult> Delete(int id)
        {
            var deletedId = await _mediator.Send(new DeleteUserCommand { Id = id });
            return Ok(deletedId);
        }

        [HttpGet("my-coupons")]
        public async Task<IActionResult> GetMyCoupons()
        {
            // 1. Identity'den giriş yapan kullanıcıyı bul
            var userIdString = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            var appUser = await _userManager.FindByIdAsync(userIdString);

            if (appUser == null) return Unauthorized();

            // 2. E-posta adresi üzerinden senin kendi "User" tablosundaki 'int' değerli kullanıcıyı bul
            var allUsers = await _mediator.Send(new GetAllUsersQuery());
            var customUser = allUsers.FirstOrDefault(u => u.Email == appUser.Email);

            // Eğer özel User tablosunda o email yoksa kuponu da yoktur (Boş liste döneriz)
            if (customUser == null)
                return Ok(new List<CleanArchitecture.Core.Entities.Coupon>());

            // 3. Bulduğumuz 'int' ID'yi (customUser.Id) kullanarak kuponları sorunsuzca getir!
            var coupons = await _mediator.Send(new GetCouponsByUserIdQuery { UserId = customUser.Id });

            if (coupons == null || !coupons.Any())
                return Ok(new List<CleanArchitecture.Core.Entities.Coupon>());

            return Ok(coupons);
        }

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            // 1. Find the logged-in user from Identity
            var userIdString = User.FindFirstValue("uid") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            var appUser = await _userManager.FindByIdAsync(userIdString);

            if (appUser == null) return Unauthorized("Session expired.");

            // 2. Attempt to change the password in the Identity (Auth) system (Checks if the current password is correct)
            var identityResult = await _userManager.ChangePasswordAsync(appUser, dto.CurrentPassword, dto.NewPassword);

            if (!identityResult.Succeeded)
            {
                // Returns an error if the old password is incorrect or the new password doesn't meet the rules
                var errors = string.Join(" | ", identityResult.Errors.Select(e => e.Description));
                return BadRequest($"Password could not be changed: {errors}");
            }

            // 3. Find the User in our custom DB via Email
            var allUsers = await _mediator.Send(new GetAllUsersQuery());
            var customUser = allUsers.FirstOrDefault(u => u.Email == appUser.Email);

            if (customUser != null)
            {
                // 4. Simultaneously change the password in our custom User database
                await _mediator.Send(new ChangeUserPasswordCommand
                {
                    UserId = customUser.Id,
                    NewPasswordPlain = dto.NewPassword
                });
            }

            return Ok(new { Message = "Your password has been successfully updated in both systems!" });
        }
    }
}