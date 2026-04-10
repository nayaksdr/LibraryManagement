using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMemberNavigation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "MemberId",
                table: "Transactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_MemberId",
                table: "Transactions",
                column: "MemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Members_MemberId",
                table: "Transactions",
                column: "MemberId",
                principalTable: "Members",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Members_MemberId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_Transactions_MemberId",
                table: "Transactions");

            migrationBuilder.DropColumn(
                name: "MemberId",
                table: "Transactions");
        }
    }
}
