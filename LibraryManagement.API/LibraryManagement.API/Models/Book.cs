namespace LibraryManagement.API.Models
{
    public class Book
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;     
        public int Quantity { get; set; }
        public int AvailableQuantity { get; set; }
        public int CategoryId { get; set; }
        public BookCategory Category { get; set; }
    }
}
