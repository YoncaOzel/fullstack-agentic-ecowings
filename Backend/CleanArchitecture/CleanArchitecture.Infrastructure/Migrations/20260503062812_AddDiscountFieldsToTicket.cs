using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanArchitecture.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountFieldsToTicket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountRate",
                table: "Tickets",
                type: "numeric(18,6)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountedPrice",
                table: "Tickets",
                type: "numeric(18,6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDiscounted",
                table: "Tickets",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountRate",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "DiscountedPrice",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "IsDiscounted",
                table: "Tickets");
        }
    }
}
