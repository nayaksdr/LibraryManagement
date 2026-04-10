using LibraryManagement.API.Data;
using LibraryManagement.API.DTOs;
using LibraryManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Services
{
    public class MemberService : IMemberService
    {
        private readonly ApplicationDbContext _context;

        public MemberService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Member>> GetAll()
        {
            return await _context.Members.ToListAsync();
        }

        public async Task<Member> GetById(int id)
        {
            return await _context.Members.FindAsync(id);
        }

        public async Task<string> Add(MemberDto dto)
        {
            var member = new Member
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PhoneNumber = dto.Phone,
                Address = dto.Address
            };

            await _context.Members.AddAsync(member);
            await _context.SaveChangesAsync();

            return "Member Added Successfully";
        }

        public async Task<string> Update(int id, MemberDto dto)
        {
            var member = await _context.Members.FindAsync(id);

            if (member == null) return "Member Not Found";

            member.FullName = dto.FullName;
            member.Email = dto.Email;
            member.PhoneNumber = dto.Phone;
            member.Address = dto.Address;

            await _context.SaveChangesAsync();

            return "Member Updated Successfully";
        }

        public async Task<string> Delete(int id)
        {
            var member = await _context.Members.FindAsync(id);

            if (member == null) return "Member Not Found";

            _context.Members.Remove(member);
            await _context.SaveChangesAsync();

            return "Member Deleted Successfully";
        }
    }
}
