using CleanArchitecture.Core.Entities;

namespace CleanArchitecture.Core.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(User user);
    }
}
