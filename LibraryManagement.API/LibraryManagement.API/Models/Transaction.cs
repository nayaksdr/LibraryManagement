using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibraryManagement.API.Models
{
    public class Transaction
    {
        [Key]
        public int  Id { get; set; }
        public int BookId { get; set; }

        [ForeignKey("BookId")]
        public Book Book { get; set; } = null!;

        [Column("UserId")]           // ✅ keeps existing DB column name (no migration needed)
        public int MemberId { get; set; }

        [ForeignKey("MemberId")]     // ✅ tells EF to join Members table, NOT Users table
        public Member Member { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; }
        public DateTime IssueDate { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public decimal FineAmount { get; set; }
        public bool IsReturned { get; set; }

    }
}
