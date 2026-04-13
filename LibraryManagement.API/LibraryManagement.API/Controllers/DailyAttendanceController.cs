using iText.Kernel.Pdf;
using LibraryManagement.API.Data;
using LibraryManagement.API.DTOs;
using LibraryManagement.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/daily-attendance")]
    public class DailyAttendanceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DailyAttendanceController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ➕ Add
        [HttpPost]
        public async Task<IActionResult> Add(DailyAttendance model)
        {
            var exists = _context.DailyAttendances
                .Any(x => x.MemberId == model.MemberId && x.AttendanceDate == model.AttendanceDate);

            if (exists)
                return BadRequest(new { message = "आजची उपस्थिती आधीच नोंदली आहे." });

            if (string.IsNullOrEmpty(model.Signature))
            {
                var member = await _context.Members.FindAsync(model.MemberId);
                model.Signature = member?.SavedSignature;
            }

            _context.DailyAttendances.Add(model);
            await _context.SaveChangesAsync();

            return Ok(model);
        }

        // 📅 Get by AttendanceDate
        [HttpGet]
        public IActionResult GetByDate(DateTime AttendanceDate)
        {
            var data = _context.DailyAttendances
                .Include(x => x.Member)
                .Where(x => x.AttendanceDate == AttendanceDate)
                .Select(x => new
                {
                    x.Id,
                    x.AttendanceDate,
                    x.Status,
                    MemberName = x.Member.FullName,
                    x.Signature
                })
                .ToList();

            return Ok(data);
        }

        // 📆 Month Report
        [HttpGet("report/month")]
        public IActionResult Month(int month, int year)
        {
            var data = _context.DailyAttendances
                .Include(x => x.Member)
                .Where(x => x.AttendanceDate.Month == month && x.AttendanceDate.Year == year)
                .Select(x => new
                {
                    x.AttendanceDate,
                    MemberName = x.Member.FullName,
                    x.Status
                })
                .ToList();

            return Ok(data);
        }

        // 🗓 Year Report
        [HttpGet("report/year")]
        public IActionResult Year(int year)
        {
            var data = _context.DailyAttendances
                .Include(x => x.Member)
                .Where(x => x.AttendanceDate.Year == year)
                .Select(x => new
                {
                    x.AttendanceDate,
                    MemberName = x.Member.FullName,
                    x.Status
                })
                .ToList();

            return Ok(data);
        }
        [HttpGet("report/pdf")]
        public IActionResult ExportPdf(DateTime AttendanceDate)
        {
            var data = BuildQuery()
                .Where(x => x.AttendanceDate == AttendanceDate)
                .ToList();

            using var ms = new MemoryStream();
            var writer = new iText.Kernel.Pdf.PdfWriter(ms);
            var pdf = new iText.Kernel.Pdf.PdfDocument(writer);
            var doc = new iText.Layout.Document(pdf);

            doc.Add(new iText.Layout.Element.Paragraph("उपस्थिती अहवाल"));

            foreach (var item in data)
            {
                doc.Add(new iText.Layout.Element.Paragraph(
                    $"{item.MemberName} - {item.NewspaperName} - {item.Status}"
                ));
            }

            doc.Close();

            return File(ms.ToArray(), "application/pdf", "attendance.pdf");
        }
        [HttpGet("report/excel")]
        public IActionResult ExportExcel(DateTime AttendanceDate)
        {
            var data = BuildQuery()
                .Where(x => x.AttendanceDate == AttendanceDate)
                .ToList();

            using var wb = new ClosedXML.Excel.XLWorkbook();
            var ws = wb.Worksheets.Add("Attendance");

            ws.Cell(1, 1).Value = "दिनांक";
            ws.Cell(1, 2).Value = "सभासद";
            ws.Cell(1, 3).Value = "वर्तमानपत्र";
            ws.Cell(1, 4).Value = "स्थिती";

            int row = 2;

            foreach (var d in data)
            {
                ws.Cell(row, 1).Value = d.AttendanceDate;
                ws.Cell(row, 2).Value = d.MemberName;
                ws.Cell(row, 3).Value = d.NewspaperName;
                ws.Cell(row, 4).Value = d.Status;
                row++;
            }

            using var stream = new MemoryStream();
            wb.SaveAs(stream);

            return File(stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "attendance.xlsx");
        }
        [HttpGet("calendar")]
        public IActionResult Calendar(int month, int year)
        {
            var dates = _context.NewspaperAttendances
                .Where(x => x.AttendanceDate.Month == month && x.AttendanceDate.Year == year)
                .Select(x => x.AttendanceDate)
                .Distinct()
                .ToList();

            return Ok(dates);
        }
        [HttpPost("approve/{id}")]
        public async Task<IActionResult> Approve(int id)
        {
            var record = await _context.NewspaperAttendances.FindAsync(id);
            if (record == null) return NotFound();

            record.Status = "Approved";
           

            await _context.SaveChangesAsync();

            return Ok(new { message = "मंजूर झाले" });
        }
        private IQueryable<NewspaperAttendanceDto> BuildQuery()
        {
            return _context.NewspaperAttendances
                .Select(x => new NewspaperAttendanceDto
                {
                    Id = x.Id,
                  
                    NewspaperName = x.Newspaper.Name,
                    Signature = x.Signature,
                    Status = x.Status,
                  
                });
        }
    }
}
