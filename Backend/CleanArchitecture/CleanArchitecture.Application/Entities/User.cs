using System;
using CleanArchitecture.Core.Enums;
using MediatR;

namespace CleanArchitecture.Core.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }

        // Kullanıcının Rolü
        public UserRoles Role { get; set; }
        public DateTime DateOfBirth { get; set; } // Doğum Tarihi
        public string Gender { get; set; } // Cinsiyet
        public string PhoneNumber { get; set; } // Telefon Numarası

    }
}
