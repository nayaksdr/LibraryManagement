using ClosedXML.Excel;
using LibraryManagement.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/member-attendance-report")]
    public class MemberAttendanceReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MemberAttendanceReportController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("monthly-excel")]
        public async Task<IActionResult> MonthlyExcel(int month, int year)
        {
            var data = await _context.MemberAttendances
                .Include(x => x.Member)
                .Where(x => x.AttendanceDate.Month == month && x.AttendanceDate.Year == year)
                .ToListAsync();

            var result = data
                .GroupBy(x => x.Member.FullName)
                .Select(g => new
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

            using var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("Monthly Report");

            ws.Cell(1, 1).Value = "Member";
            ws.Cell(1, 2).Value = "Present";
            ws.Cell(1, 3).Value = "Absent";
            ws.Cell(1, 4).Value = "Leave";
            ws.Cell(1, 5).Value = "Total";
            ws.Cell(1, 6).Value = "Percentage";

            int row = 2;
            foreach (var item in result)
            {
                ws.Cell(row, 1).Value = item.MemberName;
                ws.Cell(row, 2).Value = item.Present;
                ws.Cell(row, 3).Value = item.Absent;
                ws.Cell(row, 4).Value = item.Leave;
                ws.Cell(row, 5).Value = item.Total;
                ws.Cell(row, 6).Value = item.Percentage;
                row++;
            }

            ws.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            wb.SaveAs(stream);

            return File(
                stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"MemberAttendance_{month}_{year}.xlsx"
            );
        }
    }
}