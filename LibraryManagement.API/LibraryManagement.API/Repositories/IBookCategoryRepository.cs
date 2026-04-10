using LibraryManagement.API.Models;

namespace LibraryManagement.API.Repositories
{
    public interface IBookCategoryRepository
    {
        Task<List<BookCategory>> GetAllAsync();
        Task<BookCategory?> GetByIdAsync(int id);
        Task<BookCategory> AddAsync(BookCategory category);
        Task<BookCategory?> UpdateAsync(BookCategory category);
        Task<bool> DeleteAsync(int id);
    }
}
