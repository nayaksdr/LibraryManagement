using LibraryManagement.API.Data;
using LibraryManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Repositories
{
    public class BookRepository : IBookRepository
    {
        private readonly ApplicationDbContext _context;
        public BookRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Book>> GetAllBooksAsync()
      => await _context.Books.ToListAsync();

        public async Task<Book> GetBookByIdAsync(int id)
         => await _context.Books.FindAsync(id);

        public async Task AddBookAsync(Book book)
        {
            await _context.Books.AddAsync(book);
            await _context.SaveChangesAsync();
        }    
        public async Task UpdateBookAsync(Book book)
        {
            _context.Books.Update(book);
            await _context.SaveChangesAsync();
        }
        public async Task<bool> DeleteBookAsync(int id)
        {
            var book = await _context.Books.FindAsync(id);

            if (book == null)
            {
                return false; // Book wasn't found
            }

            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return true; // Successfully deleted
        }
    }
}
