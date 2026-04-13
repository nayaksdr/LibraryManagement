using LibraryManagement.API.DTOs;
using LibraryManagement.API.Repositories;

namespace LibraryManagement.API.Services
{
    public class NewspaperAttendanceService
    {
        private readonly INewspaperAttendanceRepository _repo;

        public NewspaperAttendanceService(INewspaperAttendanceRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<MonthlyReportDto>> GetMonthlySummary(int month, int year)
        {
            var data = await _repo.GetMonthly(month, year);

            return data.GroupBy(x => x.Newspaper.Name)
                .Select(g => new MonthlyReportDto
                {
                    Newspaper = g.Key,
                    Present = g.Count(x => x.Status == "Present"),
                    Absent = g.Count(x => x.Status == "Absent"),
                    Total = g.Count(),
                    Percentage = (g.Count(x => x.Status == "Present") * 100.0) / g.Count()
                })
                .ToList();
        }
    }
}
