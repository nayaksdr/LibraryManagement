using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class RenameUserIdToMemberIdUserName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Members_MemberId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Users_UserId",
                table: "Transactions");

            migrationBuilder.RenameColumn(
                name: "MemberId",
                table: "Transactions",
                newName: "UserId1");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_MemberId",
                table: "Transactions",
                newName: "IX_Transactions_UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Members_UserId",
                table: "Transactions",
                column: "UserId",
                principalTable: "Members",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Users_UserId1",
                table: "Transactions",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Members_UserId",
                table: "Transactions");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_Users_UserId1",
                table: "Transactions");

            migrationBuilder.RenameColumn(
                name: "UserId1",
                table: "Transactions",
                newName: "MemberId");

            migrationBuilder.RenameIndex(
                name: "IX_Transactions_UserId1",
                table: "Transactions",
                newName: "IX_Transactions_MemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Members_MemberId",
                table: "Transactions",
                column: "MemberId",
                principalTable: "Members",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_Users_UserId",
                table: "Transactions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
