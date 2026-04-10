using LibraryManagement.API.Data;
using LibraryManagement.API.Models;
using LibraryManagement.API.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookCategoryController : ControllerBase
    {
        private readonly IBookCategoryRepository _repo;

        public BookCategoryController(IBookCategoryRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
            => Ok(await _repo.GetAllAsync());

        [HttpPost]
        public async Task<IActionResult> Post(BookCategory category)
            => Ok(await _repo.AddAsync(category));

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, BookCategory category)
        {
            category.Id = id;
            var result = await _repo.UpdateAsync(category);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _repo.DeleteAsync(id);
            return success ? Ok() : NotFound();
        }
    }    
    
}
