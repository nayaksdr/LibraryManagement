using LibraryManagement.API.Data;
using LibraryManagement.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ITransactionService _service;
        private readonly ApplicationDbContext _context;

        public TransactionsController(ITransactionService service, ApplicationDbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpPost("issue")]
        public async Task<IActionResult> Issue(int bookId, int userId)
        {
            try
            {
                var result = await _service.IssueBook(bookId, userId);

                // ✅ Return proper HTTP status based on service result
                if (result == "Book not available" || result == "Member not found")
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                // ✅ Now this works because StatusCode() is a Controller method
                return StatusCode(500, new
                {
                    message = ex.Message,
                    inner = ex.InnerException?.Message,
                    trace = ex.StackTrace
                });
            }
            
        }

        [HttpPost("return")]
        public async Task<IActionResult> Return(int transactionId)
        {
            var result = await _service.ReturnBook(transactionId);

            if (result == "Invalid transaction")
                return NotFound(result);

            return Ok(result);
        }

        [HttpGet] // handles GET /api/transactions
        public async Task<IActionResult> GetAll()
        {
            var all = await _context.Transactions
                .Include(t => t.Book)
                .Include(t => t.Member)
                .Select(t => new {
                    t.Id,
                    BookTitle = t.Book.Title,
                    MemberName = t.Member.FullName,
                    t.IssueDate,
                    t.ReturnDate
                })
                .ToListAsync();
            return Ok(all);
        }
     

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveTransactions()
        {
            // We use .Include to "join" the Member and Book tables
            var active = await _context.Transactions
                .Include(t => t.Book)
                .Include(t => t.Member)
                .Where(t => t.ReturnDate == null)
                .Select(t => new {
                    t.Id,
                    BookTitle = t.Book.Title,
                    MemberName = t.Member.FullName,
                    t.IssueDate
                })
                .ToListAsync();

            return Ok(active);
        }
    }
}