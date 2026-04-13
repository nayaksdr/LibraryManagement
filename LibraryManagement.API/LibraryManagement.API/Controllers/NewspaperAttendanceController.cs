using Google.Api;
using iText.Kernel.Pdf;
using LibraryManagement.API.Data;
using LibraryManagement.API.DTOs;
using LibraryManagement.API.Models;
using LibraryManagement.API.Repositories;
using LibraryManagement.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NewspaperAttendanceController : ControllerBase
    {        
        private readonly ApplicationDbContext _context;
        private readonly INewspaperAttendanceRepository _repo;
      
        public NewspaperAttendanceController(ApplicationDbContext context,INewspaperAttendanceRepository repo)
        {
            _context = context;
            _repo = repo;          
        }

        [HttpGet("newspapers")]
        public async Task<IActionResult> GetNewspapers()
        {
            var list = await _context.Newspapers
                .Where(n => n.IsActive)
                .OrderBy(n => n.Name)
                .Select(n => new { n.Id, n.Name })
                .ToListAsync();

            return Ok(list);
        }

        // GET /api/newspaperattendance/by-date?date=2025-04-13
        // → Load existing attendance when date changes
        [HttpGet("by-date")]
        public async Task<IActionResult> GetByDate([FromQuery] DateTime date)
        {
            var dateOnly = date.Date;

            // Get all active newspapers
            var newspapers = await _context.Newspapers
                .Where(n => n.IsActive)
                .OrderBy(n => n.Name)
                .ToListAsync();

            // Get existing attendance for that date
            var existing = await _context.NewspaperAttendances
                .Where(a => a.AttendanceDate == dateOnly)
                .ToListAsync();

            // Merge: return all newspapers, fill in saved status/remark if exists
            var result = newspapers.Select(n =>
            {
                var att = existing.FirstOrDefault(a => a.NewspaperId == n.Id);
                return new AttendanceRowDto
                {
                    Id = n.Id,
                    Name = n.Name,
                    Status = att?.Status ?? "Present",
                    Remark = att?.Remark ?? ""
                };
            });

            return Ok(result);
        }

        // POST /api/newspaperattendance/save?date=2025-04-13
        // → Upsert all rows for that date
        [HttpPost("save")]
        public async Task<IActionResult> Save(
            [FromQuery] DateTime date,
            [FromBody] List<SaveAttendanceItemDto> items)
        {
            var dateOnly = date.Date;

            foreach (var item in items)
            {
                var existing = await _context.NewspaperAttendances
                    .FirstOrDefaultAsync(a =>
                        a.AttendanceDate == dateOnly &&
                        a.NewspaperId == item.NewspaperId);

                if (existing != null)
                {
                    // Update
                    existing.Status = item.Status;
                    existing.Remark = item.Remark;
                }
                else
                {
                    // Insert
                    _context.NewspaperAttendances.Add(new NewspaperAttendance
                    {
                        AttendanceDate = dateOnly,
                        NewspaperId = item.NewspaperId,
                        Status = item.Status,
                        Remark = item.Remark ?? ""
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Saved successfully" });
        }

        // ✅ Daily Report
        [HttpGet("daily")]
        public async Task<IActionResult> GetDaily(DateTime date)
        {
            var data = await _context.NewspaperAttendances
                .Include(x => x.Newspaper)
                .Where(x => x.AttendanceDate.Date == date.Date)
                .ToListAsync();

            return Ok(data);
        }

        // ✅ Monthly Report
        [HttpGet("monthly")]
        public async Task<IActionResult> GetMonthly(int month, int year)
        {
            var data = await _context.NewspaperAttendances
                .Include(x => x.Newspaper)
                .Where(x => x.AttendanceDate.Month == month && x.AttendanceDate.Year == year)
                .ToListAsync();

            var result = data
                .GroupBy(x => x.Newspaper.Name)
                .Select(g => new
                {
                    Newspaper = g.Key,
                    Present = g.Count(x => x.Status == "Present"),
                    Absent = g.Count(x => x.Status == "Absent")
                });

            return Ok(result);
        }
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _context.Newspapers
                .OrderBy(n => n.Name)
                .Select(n => new { n.Id, n.Name, n.IsActive })
                .ToListAsync();
            return Ok(list);
        }

        // POST /api/newspapers
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Newspaper model)
        {
            _context.Newspapers.Add(new Newspaper
            {
                Name = model.Name.Trim(),
                IsActive = model.IsActive
            });
            await _context.SaveChangesAsync();
            return Ok();
        }

        // PUT /api/newspapers/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Newspaper model)
        {
            var np = await _context.Newspapers.FindAsync(id);
            if (np == null) return NotFound();

            np.Name = model.Name.Trim();
            np.IsActive = model.IsActive;

            await _context.SaveChangesAsync();
            return Ok();
        }

        // DELETE /api/newspapers/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var np = await _context.Newspapers.FindAsync(id);
            if (np == null) return NotFound();

            // Soft delete (safer — keeps attendance history intact)
            np.IsActive = false;
            await _context.SaveChangesAsync();
            return Ok();
        }

    }
}
