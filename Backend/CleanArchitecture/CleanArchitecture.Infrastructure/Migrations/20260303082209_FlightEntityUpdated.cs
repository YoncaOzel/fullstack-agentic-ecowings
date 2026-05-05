using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanArchitecture.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FlightEntityUpdated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Flights_Airports_DepartureAirportId",
                table: "Flights");

            migrationBuilder.DropForeignKey(
                name: "FK_Flights_Airports_DestinationAirportId",
                table: "Flights");

            migrationBuilder.DropIndex(
                name: "IX_Flights_DepartureAirportId",
                table: "Flights");

            migrationBuilder.DropIndex(
                name: "IX_Flights_DestinationAirportId",
                table: "Flights");

            migrationBuilder.DropColumn(
                name: "DepartureAirportId",
                table: "Flights");

            migrationBuilder.DropColumn(
                name: "DestinationAirportId",
                table: "Flights");

            migrationBuilder.AddColumn<string>(
                name: "DepartureAirportCode",
                table: "Flights",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DestinationAirportCode",
                table: "Flights",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Airports",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Airports_Code",
                table: "Airports",
                column: "Code");

            migrationBuilder.CreateIndex(
                name: "IX_Flights_DepartureAirportCode",
                table: "Flights",
                column: "DepartureAirportCode");

            migrationBuilder.CreateIndex(
                name: "IX_Flights_DestinationAirportCode",
                table: "Flights",
                column: "DestinationAirportCode");

            migrationBuilder.AddForeignKey(
                name: "FK_Flights_Airports_DepartureAirportCode",
                table: "Flights",
                column: "DepartureAirportCode",
                principalTable: "Airports",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Flights_Airports_DestinationAirportCode",
                table: "Flights",
                column: "DestinationAirportCode",
                principalTable: "Airports",
                principalColumn: "Code",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Flights_Airports_DepartureAirportCode",
                table: "Flights");

            migrationBuilder.DropForeignKey(
                name: "FK_Flights_Airports_DestinationAirportCode",
                table: "Flights");

            migrationBuilder.DropIndex(
                name: "IX_Flights_DepartureAirportCode",
                table: "Flights");

            migrationBuilder.DropIndex(
                name: "IX_Flights_DestinationAirportCode",
                table: "Flights");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Airports_Code",
                table: "Airports");

            migrationBuilder.DropColumn(
                name: "DepartureAirportCode",
                table: "Flights");

            migrationBuilder.DropColumn(
                name: "DestinationAirportCode",
                table: "Flights");

            migrationBuilder.AddColumn<int>(
                name: "DepartureAirportId",
                table: "Flights",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DestinationAirportId",
                table: "Flights",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Code",
                table: "Airports",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateIndex(
                name: "IX_Flights_DepartureAirportId",
                table: "Flights",
                column: "DepartureAirportId");

            migrationBuilder.CreateIndex(
                name: "IX_Flights_DestinationAirportId",
                table: "Flights",
                column: "DestinationAirportId");

            migrationBuilder.AddForeignKey(
                name: "FK_Flights_Airports_DepartureAirportId",
                table: "Flights",
                column: "DepartureAirportId",
                principalTable: "Airports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Flights_Airports_DestinationAirportId",
                table: "Flights",
                column: "DestinationAirportId",
                principalTable: "Airports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
