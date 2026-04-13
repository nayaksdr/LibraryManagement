using LibraryManagement.API.Data;
using LibraryManagement.API.DTOs;
using LibraryManagement.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/member-attendance")]
    public class MemberAttendanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MemberAttendanceController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("members")]
        public async Task<IActionResult> GetMembers()
        {
            var members = await _context.Members
                .Where(x => x.IsActive)
                .OrderBy(x => x.FullName)
                .Select(x => new
                {
                    x.Id,
                    x.FullName,
                    x.SavedSignature
                })
                .ToListAsync();

            return Ok(members);
        }

        [HttpGet("by-date")]
        public async Task<IActionResult> GetByDate(DateTime date)
        {
            var data = await _context.MemberAttendances
                .Include(x => x.Member)
                .Where(x => x.AttendanceDate.Date == date.Date)
                .OrderBy(x => x.Member.FullName)
                .Select(x => new
                {
                    x.Id,
                    x.MemberId,
                    MemberName = x.Member.FullName,
                    x.Status,
                    x.Remark,
                    x.SignatureSnapshot,
                    x.PhotoBase64,
                    x.PhotoBgRemovedBase64
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpPost("save")]
        public async Task<IActionResult> Save([FromBody] SaveMemberAttendanceDto dto)
        {
            if (dto.AttendanceDate == default)
                return BadRequest(new { message = "Attendance date is required." });

            var date = dto.AttendanceDate.Date;

            var existing = await _context.MemberAttendances
                .Where(x => x.AttendanceDate.Date == date)
                .ToListAsync();

            _context.MemberAttendances.RemoveRange(existing);

            var entities = dto.Items.Select(x => new MemberAttendance
            {
                AttendanceDate = date,
                MemberId = x.MemberId,
                Status = x.Status,
                Remark = x.Remark,
                SignatureSnapshot = x.SignatureSnapshot,
                PhotoBase64 = x.PhotoBase64,
                PhotoBgRemovedBase64 = x.PhotoBgRemovedBase64,
                CreatedAt = DateTime.Now
            }).ToList();

            await _context.MemberAttendances.AddRangeAsync(entities);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Attendance saved successfully." });
        }

        [HttpGet("monthly-report")]
        public async Task<IActionResult> MonthlyReport(int month, int year)
        {
            var data = await _context.MemberAttendances
                .Include(x => x.Member)
                .Where(x => x.AttendanceDate.Month == month && x.AttendanceDate.Year == year)
                .ToListAsync();

            var result = data
                .GroupBy(x => x.Member.FullName)
                .Select(g => new MemberAttendanceReportDto
                {
                    MemberName = g.Key,
                    Present = g.Count(x => x.Status == "Present"),
                    Absent = g.Count(x => x.Status == "Absent"),
                    Leave = g.Count(x => x.Status == "Leave"),
                    Total = g.Count(),
                    Percentage = g.Count() == 0 ? 0 : Math.Round((g.Count(x => x.Status == "Present") * 100.0) / g.Count(), 2)
                })
                .OrderBy(x => x.MemberName)
                .ToList();

            return Ok(result);
        }

        [HttpGet("yearly-report")]
        public async Task<IActionResult> YearlyReport(int year)
        {
            var data = await _context.MemberAttendances
                .Include(x => x.Member)
                .Where(x => x.AttendanceDate.Year == year)
                .ToListAsync();

            var result = data
                .GroupBy(x => x.Member.FullName)
                .Select(g => new MemberAttendanceReportDto
                {
                    MemberName = g.Key,
                    Present = g.Count(x => x.Status == "Present"),
                    Absent = g.Count(x => x.Status == "Absent"),
                    Leave = g.Count(x => x.Status == "Leave"),
                    Total = g.Count(),
                    Percentage = g.Count() == 0 ? 0 : Math.Round((g.Count(x => x.Status == "Present") * 100.0) / g.Count(), 2)
                })
                .OrderBy(x => x.MemberName)
                .ToList();

            return Ok(result);
        }
    }
}