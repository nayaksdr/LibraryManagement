namespace LibraryManagement.API.Models
{
    public class DailyAttendance
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public DateTime AttendanceDate { get; set; }
        public string Signature { get; set; }
        public string Status { get; set; } = "Pending";

        public string ApprovedBy { get; set; }
        public DateTime? ApprovedAt { get; set; }

        public Member Member { get; set; }
    }
}
