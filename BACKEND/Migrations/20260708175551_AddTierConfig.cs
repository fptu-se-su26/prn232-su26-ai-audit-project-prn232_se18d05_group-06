using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BACKEND.Migrations
{
    /// <inheritdoc />
    public partial class AddTierConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TierConfigs",
                columns: table => new
                {
                    TierID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TierName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TierCode = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    MinOrders = table.Column<int>(type: "int", nullable: false),
                    MinRevenue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountPercent = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TierConfigs", x => x.TierID);
                });



            migrationBuilder.InsertData(
                table: "TierConfigs",
                columns: new[] { "TierID", "DiscountPercent", "IsActive", "MinOrders", "MinRevenue", "TierCode", "TierName" },
                values: new object[,]
                {
                    { 1, 0m, true, 0, 0m, "BRONZE", "Đồng" },
                    { 2, 5m, true, 50, 50000000m, "SILVER", "Bạc" },
                    { 3, 10m, true, 100, 100000000m, "GOLD", "Vàng" }
                });


        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TierConfigs");


        }
    }
}
