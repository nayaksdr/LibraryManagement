namespace LibraryManagement.API.Models
{
    public class MemberAttendance
    {
        public int Id { get; set; }

        public DateTime AttendanceDate { get; set; }

        public int MemberId { get; set; }
        public Member Member { get; set; } = default!;

        public string Status { get; set; } = "Present"; // Present / Absent / Leave
        public string? Remark { get; set; }

        public string? SignatureSnapshot { get; set; }   // auto-filled from Member.SavedSignature
        public string? PhotoBase64 { get; set; }         // camera image
        public string? PhotoBgRemovedBase64 { get; set; } // optional later

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}
