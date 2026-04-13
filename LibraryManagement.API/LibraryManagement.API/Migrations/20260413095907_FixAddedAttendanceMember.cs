using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class FixAddedAttendanceMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_NewspaperAttendances_Members_MemberId",
                table: "NewspaperAttendances");

            migrationBuilder.DropIndex(
                name: "IX_NewspaperAttendances_MemberId",
                table: "NewspaperAttendances");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "NewspaperAttendances");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "NewspaperAttendances");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "NewspaperAttendances");

            migrationBuilder.DropColumn(
                name: "LibrarianSignature",
                table: "NewspaperAttendances");

            migrationBuilder.DropColumn(
                name: "MemberId",
                table: "NewspaperAttendances");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "NewspaperAttendances",
                newName: "AttendanceDate");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "DailyAttendances",
                newName: "AttendanceDate");

            migrationBuilder.AddColumn<string>(
                name: "Remark",
                table: "NewspaperAttendances",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "MemberAttendances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AttendanceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MemberId = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Remark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SignatureSnapshot = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhotoBase64 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhotoBgRemovedBase64 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MemberAttendances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MemberAttendances_Members_MemberId",
                        column: x => x.MemberId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MemberAttendances_MemberId",
                table: "MemberAttendances",
                column: "MemberId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MemberAttendances");

            migrationBuilder.DropColumn(
                name: "Remark",
                table: "NewspaperAttendances");

            migrationBuilder.RenameColumn(
                name: "AttendanceDate",
                table: "NewspaperAttendances",
                newName: "Date");

            migrationBuilder.RenameColumn(
                name: "AttendanceDate",
                table: "DailyAttendances",
                newName: "Date");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "NewspaperAttendances",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovedBy",
                table: "NewspaperAttendances",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "NewspaperAttendances",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LibrarianSignature",
                table: "NewspaperAttendances",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MemberId",
                table: "NewspaperAttendances",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_NewspaperAttendances_MemberId",
                table: "NewspaperAttendances",
                column: "MemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_NewspaperAttendances_Members_MemberId",
                table: "NewspaperAttendances",
                column: "MemberId",
                principalTable: "Members",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
