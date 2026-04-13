namespace LibraryManagement.API.DTOs
{
    public class MemberAttendanceItemDto
    {
        public int MemberId { get; set; }
        public string Status { get; set; } = "Present";
        public string? Remark { get; set; }
        public string? SignatureSnapshot { get; set; }
        public string? PhotoBase64 { get; set; }
        public string? PhotoBgRemovedBase64 { get; set; }
    }

    public class SaveMemberAttendanceDto
    {
        public DateTime AttendanceDate { get; set; }
        public List<MemberAttendanceItemDto> Items { get; set; } = new();
    }

    public class MemberAttendanceReportDto
    {
        public string MemberName { get; set; } = string.Empty;
        public int Present { get; set; }
        public int Absent { get; set; }
        public int Leave { get; set; }
        public int Total { get; set; }
        public double Percentage { get; set; }
    }
}