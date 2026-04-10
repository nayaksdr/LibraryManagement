namespace LibraryManagement.API.DTOs
{
    public class BookDto
    {
        public string Title { get; set; }
        public string Author { get; set; }
        public int CategoryId { get; set; }
        public int Quantity { get; set; }
        public int AvailableQuantity { get; set; }
    }
}
