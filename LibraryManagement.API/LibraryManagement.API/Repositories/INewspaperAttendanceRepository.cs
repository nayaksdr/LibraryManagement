using LibraryManagement.API.Models;

namespace LibraryManagement.API.Repositories
{
    public interface INewspaperAttendanceRepository
    {
        Task<List<Newspaper>> GetActiveNewspapers();
        Task<List<NewspaperAttendance>> GetByDate(DateTime date);
        Task SaveAttendance(DateTime date, List<NewspaperAttendance> records);
        Task<List<NewspaperAttendance>> GetMonthly(int month, int year);
    }
}
