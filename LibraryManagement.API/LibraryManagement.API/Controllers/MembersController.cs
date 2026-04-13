using LibraryManagement.API.Data;
using LibraryManagement.API.DTOs;
using LibraryManagement.API.Models;
using LibraryManagement.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/members")]
    public class MembersController : ControllerBase
    {
        private readonly IMemberService _service;
        private readonly ApplicationDbContext _context;

        public MembersController(IMemberService service, ApplicationDbContext context)
        {
            _service = service;
            _context = context;
        }

        // 📋 Get All Members
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAll());
        }

        // 🔍 Get By ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetById(id);
            if (result == null) return NotFound(new { message = "Member not found." });
            return Ok(result);
        }

        // ➕ Add Member
        [HttpPost]
        public async Task<IActionResult> Add(MemberDto dto)
        {
            var result = await _service.Add(dto);
            return Ok(result);
        }

        // ✏️ Update Member
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MemberDto dto)
        {
            var result = await _service.Update(id, dto);
            if (result == null) return NotFound(new { message = "Member not found." });
            return Ok(result);
        }

        // 🗑️ Delete Member
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id);
            if (result == null) return NotFound(new { message = "Member not found." });
            return Ok(result);
        }

        // 🔽 Dropdown — includes SavedSignature for auto-fill in attendance form
        [HttpGet("dropdown")]
        public async Task<IActionResult> GetDropdown()
        {
            var members = await _context.Members
                .Where(x => x.IsActive)
                .OrderBy(x => x.FullName)
                .Select(x => new
                {
                    x.Id,
                    x.FullName,
                    x.SavedSignature   // auto-filled when member is selected in attendance
                })
                .ToListAsync();

            return Ok(members);
        }

        // ✍️ Save or Update Signature (called once per member)
        [HttpPatch("{id}/signature")]
        public async Task<IActionResult> SaveSignature(int id, [FromBody] string base64Signature)
        {
            if (string.IsNullOrWhiteSpace(base64Signature))
                return BadRequest(new { message = "Signature cannot be empty." });

            var member = await _context.Members.FindAsync(id);
            if (member == null) return NotFound(new { message = "Member not found." });

            member.SavedSignature = base64Signature;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Signature saved successfully." });
        }

        // 🔍 Get Signature by Member ID (to preview saved signature)
        [HttpGet("{id}/signature")]
        public async Task<IActionResult> GetSignature(int id)
        {
            var member = await _context.Members
                .Where(x => x.Id == id)
                .Select(x => new { x.Id, x.FullName, x.SavedSignature })
                .FirstOrDefaultAsync();

            if (member == null) return NotFound(new { message = "Member not found." });
            if (string.IsNullOrEmpty(member.SavedSignature))
                return Ok(new { hasSavedSignature = false });

            return Ok(new { hasSavedSignature = true, signature = member.SavedSignature });
        }
    }
}