using LibraryManagement.API.Models;
using Microsoft.EntityFrameworkCore;

namespace LibraryManagement.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext>options)
            : base(options) { }
        public DbSet<User> Users { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<BookCategory> BookCategories { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Member> Members { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.Property(t => t.MemberId)
                      .HasColumnName("UserId");   // ✅ tells EF the column is UserId in DB

                entity.HasOne(t => t.Member)
                      .WithMany()
                      .HasForeignKey(t => t.MemberId)
                      .HasConstraintName("FK_Transactions_Members_UserId")
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(t => t.Book)
                      .WithMany()
                      .HasForeignKey(t => t.BookId)
                      .HasConstraintName("FK_Transactions_Books_BookId")
                      .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
