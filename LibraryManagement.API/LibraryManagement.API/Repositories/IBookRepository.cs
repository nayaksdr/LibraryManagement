using LibraryManagement.API.Models;

namespace LibraryManagement.API.Repositories
{
    public interface IBookRepository
    {
        Task<IEnumerable<Book>> GetAllBooksAsync();
        Task<Book> GetBookByIdAsync(int id);
        Task AddBookAsync(Book book);
        Task UpdateBookAsync(Book book);
        Task<bool> DeleteBookAsync(int id);
    }
}
