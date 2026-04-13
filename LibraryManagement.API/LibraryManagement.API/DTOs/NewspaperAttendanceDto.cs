namespace LibraryManagement.API.DTOs
{
    
        public class NewspaperAttendanceDto
        {
            public int Id { get; set; }
        public int NewspaperId { get; set; }
        public string Status { get; set; }
        public string Remark { get; set; }
        public int MemberId { get; set; }
            public DateTime AttendanceDate { get; set; }
            public string MemberName { get; set; } = string.Empty;
            public string NewspaperName { get; set; } = string.Empty;
            public string? Signature { get; set; }
           
            public string? LibrarianSignature { get; set; }
            public string? ApprovedBy { get; set; }
            public DateTime? ApprovedAt { get; set; }
        }
    // DTOs/NewspaperAttendanceDto.cs
    public class SaveAttendanceItemDto
    {
        public int NewspaperId { get; set; }
        public string Status { get; set; }
        public string Remark { get; set; }
    }

    public class AttendanceRowDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Status { get; set; }
        public string Remark { get; set; }
    }
}

