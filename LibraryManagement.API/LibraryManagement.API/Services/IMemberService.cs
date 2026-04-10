using LibraryManagement.API.DTOs;
using LibraryManagement.API.Models;

namespace LibraryManagement.API.Services
{
    public interface IMemberService
    {
        Task<IEnumerable<Member>> GetAll();
        Task<Member> GetById(int id);
        Task<string> Add(MemberDto dto);
        Task<string> Update(int id, MemberDto dto);
        Task<string> Delete(int id);
    }
}
