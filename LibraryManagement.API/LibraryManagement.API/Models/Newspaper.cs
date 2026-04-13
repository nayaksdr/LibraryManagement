namespace LibraryManagement.API.Models
{
    public class Newspaper
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;   // e.g. Marathi, English
        public string Publisher { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public ICollection<NewspaperAttendance> Attendances { get; set; }       
    }
}
