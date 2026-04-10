using LibraryManagement.API.Models;
using LibraryManagement.API.Repositories;
using Microsoft.AspNetCore.Mvc;
using SkiaSharp;
using System.Linq.Expressions;
using Tesseract;
using Microsoft.AspNetCore.Mvc;
using SkiaSharp;
using Google.Cloud.Vision.V1;
using LibraryManagement.API.DTOs;

namespace LibraryManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly IBookRepository _repo;

        public BooksController(IBookRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var books = await _repo.GetAllBooksAsync();
            return Ok(books);
        }

        // GET: api/books/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var book = await _repo.GetBookByIdAsync(id); // Ensure this exists in your repo
            if (book == null) return NotFound(new { message = "Book not found" });
            return Ok(book);
        }       

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] BookDto dto)
        {
            try
            {

                var book = new Book
                {
                    Title = dto.Title,
                    Author = dto.Author,
                    CategoryId = dto.CategoryId,
                    Quantity = dto.Quantity,
                    AvailableQuantity = dto.AvailableQuantity
                };
                await _repo.AddBookAsync(book);

                // Professional practice: Return 201 Created with the location of the new resource
                return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // NEW: Update Book (Admin)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Book book)
        {
            if (id != book.Id) return BadRequest(new { message = "ID mismatch" });

            await _repo.UpdateBookAsync(book); // Add this to your IBookRepository
            return NoContent();
        }

        // NEW: Delete Book (Admin)
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            // Now success will correctly receive 'true' or 'false' from the repo
            var success = await _repo.DeleteBookAsync(id);

            if (!success)
            {
                return NotFound(new { message = "Cannot delete: Book not found." });
            }

            return Ok(new { message = "Book deleted successfully" });
        }
    }
}