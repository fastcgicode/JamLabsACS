using Microsoft.EntityFrameworkCore.Migrations;

namespace CallingReact.Migrations
{
    public partial class CallingReactAcsUserContext : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "name",
                table: "AcsUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "name",
                table: "AcsUsers");
        }
    }
}
