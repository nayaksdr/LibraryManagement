using LibraryManagement.API.Data;
using LibraryManagement.API.Models;
using Microsoft.EntityFrameworkCore;
using System;

namespace LibraryManagement.API.Repositories
{
    public class NewspaperAttendanceRepository : INewspaperAttendanceRepository
    {
        private readonly ApplicationDbContext _context;

        public NewspaperAttendanceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Newspaper>> GetActiveNewspapers()
        {
            return await _context.Newspapers.Where(x => x.IsActive).ToListAsync();
        }

        public async Task<List<NewspaperAttendance>> GetByDate(DateTime date)
        {
            return await _context.NewspaperAttendances
                .Include(x => x.Newspaper)
                .Where(x => x.AttendanceDate.Date == date.Date)
                .ToListAsync();
        }

        public async Task SaveAttendance(DateTime date, List<NewspaperAttendance> records)
        {
            var existing = _context.NewspaperAttendances
                .Where(x => x.AttendanceDate.Date == date.Date);

            _context.NewspaperAttendances.RemoveRange(existing);
            await _context.NewspaperAttendances.AddRangeAsync(records);
            await _context.SaveChangesAsync();
        }

        public async Task<List<NewspaperAttendance>> GetMonthly(int month, int year)
        {
            return await _context.NewspaperAttendances
                .Include(x => x.Newspaper)
                .Where(x => x.AttendanceDate.Month == month && x.AttendanceDate.Year == year)
                .ToListAsync();
        }
    }
}
