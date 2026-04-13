namespace LibraryManagement.API.Models
{
    public class NewspaperAttendance
    {
        public int Id { get; set; }
        public DateTime AttendanceDate { get; set; }

        public int NewspaperId { get; set; }
        public Newspaper Newspaper { get; set; }

        public string Signature { get; set; }
        public string Status { get; set; } // Present / Absent
        public string Remark { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

    }
}
