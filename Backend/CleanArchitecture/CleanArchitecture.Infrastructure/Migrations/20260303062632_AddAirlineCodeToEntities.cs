using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanArchitecture.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAirlineCodeToEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AirlineReviews_Airlines_AirlineId",
                table: "AirlineReviews");

            migrationBuilder.AddColumn<string>(
                name: "AirlineCode",
                table: "Airlines",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "AirlineId",
                table: "AirlineReviews",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "AirlineCode",
                table: "AirlineReviews",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AirlineReviews_Airlines_AirlineId",
                table: "AirlineReviews",
                column: "AirlineId",
                principalTable: "Airlines",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AirlineReviews_Airlines_AirlineId",
                table: "AirlineReviews");

            migrationBuilder.DropColumn(
                name: "AirlineCode",
                table: "Airlines");

            migrationBuilder.DropColumn(
                name: "AirlineCode",
                table: "AirlineReviews");

            migrationBuilder.AlterColumn<int>(
                name: "AirlineId",
                table: "AirlineReviews",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AirlineReviews_Airlines_AirlineId",
                table: "AirlineReviews",
                column: "AirlineId",
                principalTable: "Airlines",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
