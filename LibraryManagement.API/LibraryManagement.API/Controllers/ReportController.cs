using ClosedXML.Excel;
using Google.Api;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using LibraryManagement.API.Data;
using LibraryManagement.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly NewspaperAttendanceService _service;
        public ReportController(ApplicationDbContext context,NewspaperAttendanceService service)
        {
            _context = context;
            _service = service;
        }

        [HttpGet("monthly-excel")]
        public async Task<IActionResult> ExportMonthlyExcel(int month, int year)
        {
            var data = await _context.NewspaperAttendances
                .Include(x => x.Newspaper)
                .Where(x => x.AttendanceDate.Month == month && x.AttendanceDate.Year == year)
                .ToListAsync();

            var grouped = data.GroupBy(x => x.Newspaper.Name)
                .Select(g => new
                {
                    Name = g.Key,
                    Present = g.Count(x => x.Status == "Present"),
                    Absent = g.Count(x => x.Status == "Absent")
                }).ToList();

            using var wb = new XLWorkbook();
            var ws = wb.Worksheets.Add("Report");

            ws.Cell(1, 1).Value = "Newspaper";
            ws.Cell(1, 2).Value = "Present";
            ws.Cell(1, 3).Value = "Absent";

            int row = 2;
            foreach (var item in grouped)
            {
                ws.Cell(row, 1).Value = item.Name;
                ws.Cell(row, 2).Value = item.Present;
                ws.Cell(row, 3).Value = item.Absent;
                row++;
            }

            using var stream = new MemoryStream();
            wb.SaveAs(stream);

            return File(stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "MonthlyReport.xlsx");
        }

        [HttpGet("monthly-pdf")]
        public async Task<IActionResult> ExportPdf(int month, int year)
        {
            var data = await _service.GetMonthlySummary(month, year); // ✅ now strongly typed

            using var ms = new MemoryStream();
            var writer = new PdfWriter(ms);
            var pdf = new PdfDocument(writer);
            var doc = new Document(pdf);

            doc.Add(new Paragraph("Monthly Newspaper Report").SetFontSize(16));
               

            foreach (var item in data) // ✅ NO ERROR NOW
            {
                doc.Add(new Paragraph(
                    $"{item.Newspaper} - Present: {item.Present}, Absent: {item.Absent}, %: {item.Percentage:F2}"
                ));
            }

            doc.Close();

            return File(ms.ToArray(), "application/pdf", "MonthlyReport.pdf");
        }
    }
}
