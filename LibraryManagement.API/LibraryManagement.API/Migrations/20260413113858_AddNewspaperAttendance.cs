using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibraryManagement.API.Migrations
{
    /// <inheritdoc />
    public partial class AddNewspaperAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Newspapers");

            migrationBuilder.CreateIndex(
                name: "IX_NewspaperAttendances_AttendanceDate_NewspaperId",
                table: "NewspaperAttendances",
                columns: new[] { "AttendanceDate", "NewspaperId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_NewspaperAttendances_AttendanceDate_NewspaperId",
                table: "NewspaperAttendances");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Newspapers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }
    }
}
