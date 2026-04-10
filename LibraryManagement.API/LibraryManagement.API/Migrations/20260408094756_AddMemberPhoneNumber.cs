using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMemberPhoneNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "Members",
                newName: "PhoneNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PhoneNumber",
                table: "Members",
                newName: "Phone");
        }
    }
}
