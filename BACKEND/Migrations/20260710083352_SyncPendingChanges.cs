using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BACKEND.Migrations
{
    /// <inheritdoc />
    public partial class SyncPendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OperatingExpenses",
                columns: table => new
                {
                    ExpenseID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExpenseCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    ExpenseCategory = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpenseDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "APPROVED"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperatingExpenses", x => x.ExpenseID);
                    table.ForeignKey(
                        name: "FK_OperatingExpenses_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "WarehouseLayoutMaps",
                columns: table => new
                {
                    MapID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WarehouseID = table.Column<int>(type: "int", nullable: false),
                    MapName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CanvasWidth = table.Column<int>(type: "int", nullable: false),
                    CanvasHeight = table.Column<int>(type: "int", nullable: false),
                    BackgroundImageURL = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    ScaleMeterPerPixel = table.Column<decimal>(type: "decimal(10,4)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__WarehouseLayoutMaps", x => x.MapID);
                    table.ForeignKey(
                        name: "FK__WarehouseLayoutMaps__Users",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__WarehouseLayoutMaps__Warehouses",
                        column: x => x.WarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "WarehouseID");
                });

            migrationBuilder.CreateTable(
                name: "WarehouseLayoutObjects",
                columns: table => new
                {
                    ObjectID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MapID = table.Column<int>(type: "int", nullable: false),
                    ObjectType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    RefType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true),
                    RefID = table.Column<int>(type: "int", nullable: true),
                    Label = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    X = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Y = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Width = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Height = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    RotationDeg = table.Column<decimal>(type: "decimal(8,2)", nullable: true, defaultValue: 0m),
                    FillColor = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    StrokeColor = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    ZIndex = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    IsLocked = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__WarehouseLayoutObjects", x => x.ObjectID);
                    table.ForeignKey(
                        name: "FK__WarehouseLayoutObjects__Maps",
                        column: x => x.MapID,
                        principalTable: "WarehouseLayoutMaps",
                        principalColumn: "MapID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_OperatingExpenses_CreatedBy",
                table: "OperatingExpenses",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "UQ_OperatingExpenses_ExpenseCode",
                table: "OperatingExpenses",
                column: "ExpenseCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseLayoutMaps_CreatedBy",
                table: "WarehouseLayoutMaps",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseLayoutMaps_WarehouseID",
                table: "WarehouseLayoutMaps",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseLayoutObjects_MapID",
                table: "WarehouseLayoutObjects",
                column: "MapID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OperatingExpenses");

            migrationBuilder.DropTable(
                name: "WarehouseLayoutObjects");

            migrationBuilder.DropTable(
                name: "WarehouseLayoutMaps");
        }
    }
}
