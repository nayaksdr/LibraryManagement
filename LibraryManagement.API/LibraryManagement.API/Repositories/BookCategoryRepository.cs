using LibraryManagement.API.Data;
using LibraryManagement.API.Models;
using Microsoft.EntityFrameworkCore;
namespace LibraryManagement.API.Repositories
{

    public class BookCategoryRepository : IBookCategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public BookCategoryRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<BookCategory>> GetAllAsync()
        {
            return await _context.BookCategories
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<BookCategory?> GetByIdAsync(int id)
        {
            return await _context.BookCategories.FindAsync(id);
        }

        public async Task<BookCategory> AddAsync(BookCategory category)
        {
            _context.BookCategories.Add(category);
            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<BookCategory?> UpdateAsync(BookCategory category)
        {
            var existing = await _context.BookCategories.FindAsync(category.Id);
            if (existing == null) return null;

            existing.Name = category.Name;

            await _context.SaveChangesAsync();
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var existing = await _context.BookCategories.FindAsync(id);
            if (existing == null) return false;

            _context.BookCategories.Remove(existing);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
