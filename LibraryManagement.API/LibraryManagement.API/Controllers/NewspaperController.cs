using LibraryManagement.API.Data;
using LibraryManagement.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/newspapers")]
    public class NewspaperController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public NewspaperController(ApplicationDbContext context) => _context = context;

        // 📋 Get all active newspapers (for dropdown)
        [HttpGet]
        public IActionResult GetAll() =>
            Ok(_context.Newspapers.Where(n => n.IsActive).OrderBy(n => n.Name).ToList());

        // ➕ Add
        [HttpPost]
        public async Task<IActionResult> Add(Newspaper model)
        {
            _context.Newspapers.Add(model);
            await _context.SaveChangesAsync();
            return Ok(model);
        }

        // ✏️ Update
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Newspaper model)
        {
            var existing = await _context.Newspapers.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Name = model.Name;
            existing.Language = model.Language;
            existing.Publisher = model.Publisher;
            existing.IsActive = model.IsActive;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        // 🗑️ Soft Delete
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var existing = await _context.Newspapers.FindAsync(id);
            if (existing == null) return NotFound();
            existing.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Newspaper deactivated" });
        }
    }
}

