using LibraryManagement.API.Data;
using LibraryManagement.API.DTOs;
using LibraryManagement.API.Helpers;
using LibraryManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Services
{
 
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtHelper _jwt;

        public AuthService(ApplicationDbContext context, JwtHelper jwt)
        {
            _context = context;
            _jwt = jwt;
        }

        public async Task<string> Register(RegisterDto dto)
        {
            var userExists = await _context.Users
                .AnyAsync(x => x.Email == dto.Email);

            if (userExists)
                return "User already exists";

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Password = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return "User Registered Successfully";
        }
        [Authorize(Roles = "Admin")]
        public async Task<string> Login(LoginDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (user == null)
                return "User not found";

            bool isValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.Password);

            if (!isValid)
                return "Invalid password";

            var token = _jwt.GenerateToken(user);

            return token;
        }
    }
}
