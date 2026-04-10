namespace LibraryManagement.API.Models
{
    public class Member
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PhoneNumber { get; set; } = string.Empty;

        public string Address { get; set; }

        public DateTime MembershipDate { get; set; } = DateTime.Now;

        public bool IsActive { get; set; } = true;
    }
}
