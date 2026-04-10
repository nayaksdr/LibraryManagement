using LibraryManagement.API.DTOs;

namespace LibraryManagement.API.Services
{
    public interface IAuthService
    {
        Task<string> Register(RegisterDto dto);
        Task<string> Login(LoginDto dto);
    }
}
