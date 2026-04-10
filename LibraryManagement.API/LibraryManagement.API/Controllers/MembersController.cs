using LibraryManagement.API.Data;
using LibraryManagement.API.DTOs;
using LibraryManagement.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{ 

    [ApiController]
    [Route("api/[controller]")]
    public class MembersController : ControllerBase
    {
        private readonly IMemberService _service;
        private readonly ApplicationDbContext _context;

        public MembersController(IMemberService service,ApplicationDbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAll());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            return Ok(await _service.GetById(id));
        }

        [HttpPost]
        public async Task<IActionResult> Add(MemberDto dto)
        {
            var result = await _service.Add(dto);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, MemberDto dto)
        {
            var result = await _service.Update(id, dto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.Delete(id);
            return Ok(result);
        }
        [HttpGet("dropdown")]
        public async Task<IActionResult> GetDropdown()
        {
            var members = await _context.Members
                .Where(x => x.IsActive)
                .Select(x => new
                {
                    x.Id,
                    x.FullName
                })
                .ToListAsync();

            return Ok(members);
        }
    }
}
