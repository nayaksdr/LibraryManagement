using LibraryManagement.API.Data;
using LibraryManagement.API.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace LibraryManagement.API.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ApplicationDbContext _context;

        public TransactionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> IssueBook(int bookId, int memberId)
        {
            var book = await _context.Books.FindAsync(bookId);
            if (book == null || book.AvailableQuantity <= 0)
                return "Book not available";

            var memberExists = await _context.Members.AnyAsync(m => m.Id == memberId);
            if (!memberExists)
                return "Member not found";

            var transaction = new Transaction
            {
                BookId = bookId,
                MemberId = memberId,
                IssueDate = DateTime.Now,
                DueDate = DateTime.Now.AddDays(7),
                IsReturned = false,
                FineAmount = 0   // ✅ explicitly set to avoid null issues
            };

            book.AvailableQuantity--;
            await _context.Transactions.AddAsync(transaction);

            try
            {
                await _context.SaveChangesAsync();
                return "Book Issued Successfully";
            }
            catch (DbUpdateException ex)
            {
                // This gives you the REAL database error
                var innerMsg = ex.InnerException?.Message ?? ex.Message;
                throw new Exception($"DB ERROR: {innerMsg}");  // ✅ bubbles up to controller catch
            }
        }

        public async Task<string> ReturnBook(int transactionId)
        {
            var txn = await _context.Transactions
                .Include(t => t.Book)
                .FirstOrDefaultAsync(t => t.Id == transactionId);

            if (txn == null) return "Invalid transaction";

            txn.ReturnDate = DateTime.Now;
            txn.IsReturned = true;

            // Fine calculation
            if (txn.ReturnDate > txn.DueDate)
            {
                var daysLate = (txn.ReturnDate.Value - txn.DueDate).Days;
                txn.FineAmount = daysLate * 10; // ₹10 per day
            }

            txn.Book.AvailableQuantity++;

            await _context.SaveChangesAsync();

            return "Book Returned Successfully";
        }
    }
}
