using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BACKEND.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='APIIntegrationLogs' AND xtype='U')
BEGIN
    CREATE TABLE [APIIntegrationLogs] (
        [LogID] bigint NOT NULL IDENTITY(1,1),
        [APIName] varchar(100) NOT NULL,
        [Endpoint] varchar(500) NULL,
        [Method] varchar(10) NULL,
        [StatusCode] int NULL,
        [DurationMs] int NULL,
        [IsSuccess] bit NULL,
        [ErrorMessage] nvarchar(1000) NULL,
        [LoggedAt] datetime2 NULL DEFAULT (getdate()),
        CONSTRAINT [PK_APIIntegrationLogs] PRIMARY KEY ([LogID])
    );
END");

            migrationBuilder.CreateTable(
                name: "CompanyProfile",
                columns: table => new
                {
                    CompanyID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TaxCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Phone = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    Website = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
                    Logo_URL = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    DigitalSignPath = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__CompanyP__2D971C4CC00106B3", x => x.CompanyID);
                });

            migrationBuilder.CreateTable(
                name: "DebtTermConfigs",
                columns: table => new
                {
                    TermID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerTier = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    PaymentDays = table.Column<int>(type: "int", nullable: false),
                    ReminderDay1 = table.Column<int>(type: "int", nullable: true, defaultValue: 3),
                    ReminderDay2 = table.Column<int>(type: "int", nullable: true, defaultValue: 1),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__DebtTerm__410A2E45333850B3", x => x.TermID);
                });

            migrationBuilder.CreateTable(
                name: "Drivers",
                columns: table => new
                {
                    DriverID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DriverCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    LicenseNo = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    LicenseExpiry = table.Column<DateOnly>(type: "date", nullable: true),
                    IsBlacklisted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    BlacklistReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Drivers__F1B1CD24F28E44A5", x => x.DriverID);
                });

            migrationBuilder.CreateTable(
                name: "MasterCategory",
                columns: table => new
                {
                    CategoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    Code = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    NameVN = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameEN = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MasterCa__19093A2BD202784D", x => x.CategoryID);
                });

            migrationBuilder.CreateTable(
                name: "NotificationConfigs",
                columns: table => new
                {
                    ConfigID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventType = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    Channel = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    Template = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notifica__C3BC333C1ACBF3C8", x => x.ConfigID);
                });

            migrationBuilder.CreateTable(
                name: "PriceConfig",
                columns: table => new
                {
                    PriceID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ServiceType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Zone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BasePrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Unit = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    SurchargeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SurchargeValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__PriceCon__4957584F90492AAC", x => x.PriceID);
                });

            migrationBuilder.CreateTable(
                name: "ProductCategories",
                columns: table => new
                {
                    CategoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParentID = table.Column<int>(type: "int", nullable: true),
                    CategoryCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    CategoryName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ProductC__19093A2B2E5608A4", x => x.CategoryID);
                    table.ForeignKey(
                        name: "FK__ProductCa__Paren__0D7A0286",
                        column: x => x.ParentID,
                        principalTable: "ProductCategories",
                        principalColumn: "CategoryID");
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    RoleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Roles__8AFACE3AFE501C1F", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "SLAConfig",
                columns: table => new
                {
                    SLAID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartnerTier = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    MaxWaitHours = table.Column<int>(type: "int", nullable: false),
                    MaxDockhours = table.Column<int>(type: "int", nullable: false),
                    CompensationPct = table.Column<decimal>(type: "decimal(5,2)", nullable: true, defaultValue: 0m),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__SLAConfi__2848A229181356FF", x => x.SLAID);
                });

            migrationBuilder.CreateTable(
                name: "Warehouses",
                columns: table => new
                {
                    WarehouseID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WarehouseCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    WarehouseName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TotalCapacity = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Warehous__2608AFD9CC97172D", x => x.WarehouseID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "varchar(256)", unicode: false, maxLength: 256, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "varchar(150)", unicode: false, maxLength: 150, nullable: false),
                    Phone = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    RoleID = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    LastLoginAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__1788CCACA1ED6609", x => x.UserID);
                    table.ForeignKey(
                        name: "FK__Users__RoleID__4E88ABD4",
                        column: x => x.RoleID,
                        principalTable: "Roles",
                        principalColumn: "RoleID");
                });

            migrationBuilder.CreateTable(
                name: "Docks",
                columns: table => new
                {
                    DockID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WarehouseID = table.Column<int>(type: "int", nullable: false),
                    DockCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    DockName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "AVAILABLE"),
                    MaxTruckLength = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Docks__9D8210D4554052CA", x => x.DockID);
                    table.ForeignKey(
                        name: "FK__Docks__Warehouse__07C12930",
                        column: x => x.WarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "WarehouseID");
                });

            migrationBuilder.CreateTable(
                name: "WarehouseZones",
                columns: table => new
                {
                    ZoneID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WarehouseID = table.Column<int>(type: "int", nullable: false),
                    ZoneCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    ZoneName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ZoneType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true),
                    Capacity = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Warehous__601667955288468D", x => x.ZoneID);
                    table.ForeignKey(
                        name: "FK__Warehouse__Wareh__787EE5A0",
                        column: x => x.WarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "WarehouseID");
                });

            migrationBuilder.CreateTable(
                name: "AiModelTrainingLogs",
                columns: table => new
                {
                    TrainingLogID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ModelName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ModelVersion = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    TrainingDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataFrom = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataTo = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AccuracyScore = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    Status = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TriggeredBy = table.Column<int>(type: "int", nullable: true),
                    TriggerType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiModelTrainingLogs", x => x.TrainingLogID);
                    table.ForeignKey(
                        name: "FK_AiModelTrainingLogs_Users_TriggeredBy",
                        column: x => x.TriggeredBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "AIParameters",
                columns: table => new
                {
                    ParamID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParamKey = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    ParamValue = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    UpdatedBy = table.Column<int>(type: "int", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__AIParame__C132B1047102B05A", x => x.ParamID);
                    table.ForeignKey(
                        name: "FK__AIParamet__Updat__68D28DBC",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "AuditLog",
                columns: table => new
                {
                    LogID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    IPAddress = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Action = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    TableName = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    RecordID = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    OldValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewValue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LoggedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__AuditLog__5E5499A88551975A", x => x.LogID);
                    table.ForeignKey(
                        name: "FK__AuditLog__UserID__534D60F1",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    CustomerID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ContactName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "varchar(150)", unicode: false, maxLength: 150, nullable: false),
                    Phone = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TaxCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    Tier = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true, defaultValue: "BRONZE"),
                    TierUpdatedAt = table.Column<DateOnly>(type: "date", nullable: true),
                    TotalOrders12M = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    TierGraceTo = table.Column<DateOnly>(type: "date", nullable: true),
                    SLAID = table.Column<int>(type: "int", nullable: true),
                    UserID = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Customer__A4AE64B808583DBE", x => x.CustomerID);
                    table.ForeignKey(
                        name: "FK__Customers__SLAID__59FA5E80",
                        column: x => x.SLAID,
                        principalTable: "SLAConfig",
                        principalColumn: "SLAID");
                    table.ForeignKey(
                        name: "FK__Customers__UserI__5AEE82B9",
                        column: x => x.UserID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "ExceptionExpenses",
                columns: table => new
                {
                    ExpenseID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExpenseCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpenseDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "PENDING"),
                    ApprovedBy = table.Column<int>(type: "int", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RequestedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Exceptio__1445CFF3162873CF", x => x.ExpenseID);
                    table.ForeignKey(
                        name: "FK__Exception__Appro__5E54FF49",
                        column: x => x.ApprovedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__Exception__Reque__5F492382",
                        column: x => x.RequestedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "FAQItems",
                columns: table => new
                {
                    FAQID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Question = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Answer = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Tags = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__FAQItems__4B89D1E20435AB80", x => x.FAQID);
                    table.ForeignKey(
                        name: "FK__FAQItems__Create__640DD89F",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "FinancialForecasts",
                columns: table => new
                {
                    ForecastID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ForecastMonth = table.Column<DateTime>(type: "date", nullable: false),
                    ForecastRevenue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ForecastExpense = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ForecastProfit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CashInForecast = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CashOutForecast = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ConfidenceScore = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    RiskLevel = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    TrendDirection = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    ModelVersion = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    Insight = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FinancialForecasts", x => x.ForecastID);
                    table.ForeignKey(
                        name: "FK_FinancialForecasts_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "StocktakeOrders",
                columns: table => new
                {
                    StocktakeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StocktakeCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    WarehouseID = table.Column<int>(type: "int", nullable: false),
                    StocktakeDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "DRAFT"),
                    VarianceAlert = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Stocktak__5874C405D118B2BC", x => x.StocktakeID);
                    table.ForeignKey(
                        name: "FK__Stocktake__Creat__42E1EEFE",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__Stocktake__Wareh__40058253",
                        column: x => x.WarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "WarehouseID");
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    VehicleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TruckPlate = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    TrailerPlate = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    VehicleType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    MaxWeightTon = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    OwnerName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    OwnerPhone = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    IsInternal = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    DefaultDriverID = table.Column<int>(type: "int", nullable: true),
                    InspectionExpiry = table.Column<DateOnly>(type: "date", nullable: true),
                    NextServiceDate = table.Column<DateOnly>(type: "date", nullable: true),
                    GPSDeviceID = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    IsBlacklisted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    BlacklistReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "ACTIVE"),
                    IsTempProfile = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    TempExpiryAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Vehicles__476B54B258607EC5", x => x.VehicleID);
                    table.ForeignKey(
                        name: "FK__Vehicles__Create__0F2D40CE",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__Vehicles__Defaul__0B5CAFEA",
                        column: x => x.DefaultDriverID,
                        principalTable: "Drivers",
                        principalColumn: "DriverID");
                });

            migrationBuilder.CreateTable(
                name: "WarehouseShelves",
                columns: table => new
                {
                    ShelfID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ZoneID = table.Column<int>(type: "int", nullable: false),
                    ShelfCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    FloorLevel = table.Column<byte>(type: "tinyint", nullable: true, defaultValue: (byte)1),
                    MaxWeightKg = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Warehous__DBD04F2766ED28D6", x => x.ShelfID);
                    table.ForeignKey(
                        name: "FK__Warehouse__ZoneI__7C4F7684",
                        column: x => x.ZoneID,
                        principalTable: "WarehouseZones",
                        principalColumn: "ZoneID");
                });

            migrationBuilder.CreateTable(
                name: "InboundOrders",
                columns: table => new
                {
                    InboundID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InboundCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    CustomerID = table.Column<int>(type: "int", nullable: false),
                    WarehouseID = table.Column<int>(type: "int", nullable: false),
                    ExpectedDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ActualDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true, defaultValue: "PENDING"),
                    OCRConfidence = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    OCRRawData = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequireManual = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__InboundO__B4DB7A95E39B9225", x => x.InboundID);
                    table.ForeignKey(
                        name: "FK__InboundOr__Creat__2DE6D218",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__InboundOr__Custo__2A164134",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                    table.ForeignKey(
                        name: "FK__InboundOr__Wareh__2B0A656D",
                        column: x => x.WarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "WarehouseID");
                });

            migrationBuilder.CreateTable(
                name: "SKUs",
                columns: table => new
                {
                    SKUID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SKUCode = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    Barcode = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    QRCode = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true),
                    ProductName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    CategoryID = table.Column<int>(type: "int", nullable: true),
                    CustomerID = table.Column<int>(type: "int", nullable: true),
                    WeightKg = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    LengthCm = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    WidthCm = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    HeightCm = table.Column<decimal>(type: "decimal(8,2)", nullable: true),
                    VolumeCBM = table.Column<decimal>(type: "numeric(36,15)", nullable: true, computedColumnSql: "(round((([LengthCm]*[WidthCm])*[HeightCm])/(1000000.0),(6)))", stored: true),
                    StorageTemp = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    IsFragile = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    IsHazmat = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    IsHeavy = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    SafetyMinQty = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    SafetyDebounceH = table.Column<int>(type: "int", nullable: true, defaultValue: 12),
                    ExpiryDays = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__SKUs__9AEA1BAC40ACE245", x => x.SKUID);
                    table.ForeignKey(
                        name: "FK__SKUs__CategoryID__123EB7A3",
                        column: x => x.CategoryID,
                        principalTable: "ProductCategories",
                        principalColumn: "CategoryID");
                    table.ForeignKey(
                        name: "FK__SKUs__CustomerID__1332DBDC",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                });

            migrationBuilder.CreateTable(
                name: "Vouchers",
                columns: table => new
                {
                    VoucherID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VoucherCode = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    CustomerTier = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    CustomerID = table.Column<int>(type: "int", nullable: true),
                    DiscountPct = table.Column<decimal>(type: "decimal(5,2)", nullable: true, defaultValue: 0m),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    MinOrderValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    ValidFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    ValidTo = table.Column<DateOnly>(type: "date", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    UsedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Vouchers__3AEE79C137A00021", x => x.VoucherID);
                    table.ForeignKey(
                        name: "FK__Vouchers__Custom__60A75C0F",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                });

            migrationBuilder.CreateTable(
                name: "VehicleMaintenanceLogs",
                columns: table => new
                {
                    MaintenanceID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleID = table.Column<int>(type: "int", nullable: false),
                    MaintenanceType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    ServiceDate = table.Column<DateOnly>(type: "date", nullable: false),
                    NextServiceDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ServiceCenter = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CostAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__VehicleM__E60542B5662CA286", x => x.MaintenanceID);
                    table.ForeignKey(
                        name: "FK__VehicleMa__Vehic__2704CA5F",
                        column: x => x.VehicleID,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID");
                });

            migrationBuilder.CreateTable(
                name: "WarehouseBins",
                columns: table => new
                {
                    BinID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShelfID = table.Column<int>(type: "int", nullable: false),
                    BinCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    BinType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true),
                    CapacityCBM = table.Column<decimal>(type: "decimal(8,3)", nullable: true),
                    MaxWeightKg = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    IsOccupied = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Warehous__4BFF5A4E1D1FFFDA", x => x.BinID);
                    table.ForeignKey(
                        name: "FK__Warehouse__Shelf__02084FDA",
                        column: x => x.ShelfID,
                        principalTable: "WarehouseShelves",
                        principalColumn: "ShelfID");
                });

            migrationBuilder.CreateTable(
                name: "StockAlerts",
                columns: table => new
                {
                    AlertID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SKUID = table.Column<int>(type: "int", nullable: false),
                    AlertType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    CurrentQty = table.Column<int>(type: "int", nullable: true),
                    ThresholdQty = table.Column<int>(type: "int", nullable: true),
                    EmailSentAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NextAllowedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsResolved = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__StockAle__EBB16AED03ECFEA6", x => x.AlertID);
                    table.ForeignKey(
                        name: "FK__StockAler__SKUID__5CA1C101",
                        column: x => x.SKUID,
                        principalTable: "SKUs",
                        principalColumn: "SKUID");
                });

            migrationBuilder.CreateTable(
                name: "ServiceOrders",
                columns: table => new
                {
                    OrderID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    CustomerID = table.Column<int>(type: "int", nullable: false),
                    WarehouseID = table.Column<int>(type: "int", nullable: false),
                    ServiceType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    PickupAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DeliveryAddress = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PickupLat = table.Column<decimal>(type: "decimal(10,7)", nullable: true),
                    PickupLng = table.Column<decimal>(type: "decimal(10,7)", nullable: true),
                    DeliveryLat = table.Column<decimal>(type: "decimal(10,7)", nullable: true),
                    DeliveryLng = table.Column<decimal>(type: "decimal(10,7)", nullable: true),
                    TotalWeightKg = table.Column<decimal>(type: "decimal(12,3)", nullable: true),
                    TotalCBM = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    TotalPallets = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    VoucherID = table.Column<int>(type: "int", nullable: true),
                    DiscountAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    FinalCost = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Status = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true, defaultValue: "DRAFT"),
                    Priority = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "NORMAL"),
                    PriorityScore = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    SLAID = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveredAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ServiceO__C3905BAF116DD46C", x => x.OrderID);
                    table.ForeignKey(
                        name: "FK__ServiceOr__Creat__6AEFE058",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__ServiceOr__Custo__625A9A57",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                    table.ForeignKey(
                        name: "FK__ServiceOr__SLAID__69FBBC1F",
                        column: x => x.SLAID,
                        principalTable: "SLAConfig",
                        principalColumn: "SLAID");
                    table.ForeignKey(
                        name: "FK__ServiceOr__Vouch__65370702",
                        column: x => x.VoucherID,
                        principalTable: "Vouchers",
                        principalColumn: "VoucherID");
                    table.ForeignKey(
                        name: "FK__ServiceOr__Wareh__634EBE90",
                        column: x => x.WarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "WarehouseID");
                });

            migrationBuilder.CreateTable(
                name: "InboundOrderLines",
                columns: table => new
                {
                    LineID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InboundID = table.Column<int>(type: "int", nullable: false),
                    SKUID = table.Column<int>(type: "int", nullable: false),
                    ExpectedQty = table.Column<int>(type: "int", nullable: false),
                    ReceivedQty = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    BinID = table.Column<int>(type: "int", nullable: true),
                    AISlottedBinID = table.Column<int>(type: "int", nullable: true),
                    BatchNo = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    ExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ConditionStatus = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true, defaultValue: "GOOD"),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__InboundO__2EAE64C92F4066DB", x => x.LineID);
                    table.ForeignKey(
                        name: "FK__InboundOr__AISlo__3587F3E0",
                        column: x => x.AISlottedBinID,
                        principalTable: "WarehouseBins",
                        principalColumn: "BinID");
                    table.ForeignKey(
                        name: "FK__InboundOr__BinID__3493CFA7",
                        column: x => x.BinID,
                        principalTable: "WarehouseBins",
                        principalColumn: "BinID");
                    table.ForeignKey(
                        name: "FK__InboundOr__Inbou__31B762FC",
                        column: x => x.InboundID,
                        principalTable: "InboundOrders",
                        principalColumn: "InboundID");
                    table.ForeignKey(
                        name: "FK__InboundOr__SKUID__32AB8735",
                        column: x => x.SKUID,
                        principalTable: "SKUs",
                        principalColumn: "SKUID");
                });

            migrationBuilder.CreateTable(
                name: "Inventory",
                columns: table => new
                {
                    InventoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SKUID = table.Column<int>(type: "int", nullable: false),
                    BinID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    BatchNo = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    ExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    InboundDate = table.Column<DateOnly>(type: "date", nullable: true, defaultValueSql: "(CONVERT([date],getdate()))"),
                    LastCountDate = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Inventor__F5FDE6D31F98832F", x => x.InventoryID);
                    table.ForeignKey(
                        name: "FK__Inventory__BinID__1EA48E88",
                        column: x => x.BinID,
                        principalTable: "WarehouseBins",
                        principalColumn: "BinID");
                    table.ForeignKey(
                        name: "FK__Inventory__SKUID__1DB06A4F",
                        column: x => x.SKUID,
                        principalTable: "SKUs",
                        principalColumn: "SKUID");
                });

            migrationBuilder.CreateTable(
                name: "StockLedger",
                columns: table => new
                {
                    LedgerID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SKUID = table.Column<int>(type: "int", nullable: false),
                    BinID = table.Column<int>(type: "int", nullable: true),
                    TxnType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    Qty = table.Column<int>(type: "int", nullable: false),
                    QtyBefore = table.Column<int>(type: "int", nullable: false),
                    QtyAfter = table.Column<int>(type: "int", nullable: false),
                    RefType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true),
                    RefID = table.Column<int>(type: "int", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__StockLed__AE70E0AF0B706E50", x => x.LedgerID);
                    table.ForeignKey(
                        name: "FK__StockLedg__BinID__245D67DE",
                        column: x => x.BinID,
                        principalTable: "WarehouseBins",
                        principalColumn: "BinID");
                    table.ForeignKey(
                        name: "FK__StockLedg__Creat__25518C17",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__StockLedg__SKUID__236943A5",
                        column: x => x.SKUID,
                        principalTable: "SKUs",
                        principalColumn: "SKUID");
                });

            migrationBuilder.CreateTable(
                name: "StocktakeLines",
                columns: table => new
                {
                    LineID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StocktakeID = table.Column<int>(type: "int", nullable: false),
                    SKUID = table.Column<int>(type: "int", nullable: false),
                    BinID = table.Column<int>(type: "int", nullable: true),
                    SystemQty = table.Column<int>(type: "int", nullable: false),
                    CountedQty = table.Column<int>(type: "int", nullable: true),
                    Variance = table.Column<int>(type: "int", nullable: true, computedColumnSql: "([CountedQty]-[SystemQty])", stored: true),
                    VariancePct = table.Column<decimal>(type: "decimal(8,2)", nullable: true, computedColumnSql: "(case when [SystemQty]=(0) then NULL else CONVERT([decimal](8,2),(([CountedQty]-[SystemQty])*(100.0))/[SystemQty]) end)", stored: true),
                    RequireRecount = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Stocktak__2EAE64C93ADD69C1", x => x.LineID);
                    table.ForeignKey(
                        name: "FK__Stocktake__BinID__47A6A41B",
                        column: x => x.BinID,
                        principalTable: "WarehouseBins",
                        principalColumn: "BinID");
                    table.ForeignKey(
                        name: "FK__Stocktake__SKUID__46B27FE2",
                        column: x => x.SKUID,
                        principalTable: "SKUs",
                        principalColumn: "SKUID");
                    table.ForeignKey(
                        name: "FK__Stocktake__Stock__45BE5BA9",
                        column: x => x.StocktakeID,
                        principalTable: "StocktakeOrders",
                        principalColumn: "StocktakeID");
                });

            migrationBuilder.CreateTable(
                name: "StockTransfers",
                columns: table => new
                {
                    TransferID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransferCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    SKUID = table.Column<int>(type: "int", nullable: false),
                    FromBinID = table.Column<int>(type: "int", nullable: false),
                    ToBinID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "PENDING"),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__StockTra__95490171E12CED53", x => x.TransferID);
                    table.ForeignKey(
                        name: "FK__StockTran__Creat__503BEA1C",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__StockTran__FromB__4D5F7D71",
                        column: x => x.FromBinID,
                        principalTable: "WarehouseBins",
                        principalColumn: "BinID");
                    table.ForeignKey(
                        name: "FK__StockTran__SKUID__4C6B5938",
                        column: x => x.SKUID,
                        principalTable: "SKUs",
                        principalColumn: "SKUID");
                    table.ForeignKey(
                        name: "FK__StockTran__ToBin__4E53A1AA",
                        column: x => x.ToBinID,
                        principalTable: "WarehouseBins",
                        principalColumn: "BinID");
                });

            migrationBuilder.CreateTable(
                name: "StockWriteOffs",
                columns: table => new
                {
                    WriteOffID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WriteOffCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    SKUID = table.Column<int>(type: "int", nullable: false),
                    BinID = table.Column<int>(type: "int", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "PENDING"),
                    ApprovedBy = table.Column<int>(type: "int", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__StockWri__63345CCB9B741003", x => x.WriteOffID);
                    table.ForeignKey(
                        name: "FK__StockWrit__Appro__57DD0BE4",
                        column: x => x.ApprovedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__StockWrit__BinID__55F4C372",
                        column: x => x.BinID,
                        principalTable: "WarehouseBins",
                        principalColumn: "BinID");
                    table.ForeignKey(
                        name: "FK__StockWrit__Creat__58D1301D",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__StockWrit__SKUID__55009F39",
                        column: x => x.SKUID,
                        principalTable: "SKUs",
                        principalColumn: "SKUID");
                });

            migrationBuilder.CreateTable(
                name: "Complaints",
                columns: table => new
                {
                    ComplaintID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ComplaintCode = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    CustomerID = table.Column<int>(type: "int", nullable: false),
                    OrderID = table.Column<int>(type: "int", nullable: true),
                    ComplaintType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Status = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true, defaultValue: "OPEN"),
                    AssignedTo = table.Column<int>(type: "int", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ResolutionNote = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    DeadlineAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Complain__740D89AF46E8B5FE", x => x.ComplaintID);
                    table.ForeignKey(
                        name: "FK_Complaint_Order",
                        column: x => x.OrderID,
                        principalTable: "ServiceOrders",
                        principalColumn: "OrderID");
                    table.ForeignKey(
                        name: "FK__Complaint__Assig__6B24EA82",
                        column: x => x.AssignedTo,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__Complaint__Custo__693CA210",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    InvoiceID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceNo = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    OrderID = table.Column<int>(type: "int", nullable: false),
                    CustomerID = table.Column<int>(type: "int", nullable: false),
                    IssueDate = table.Column<DateOnly>(type: "date", nullable: false, defaultValueSql: "(CONVERT([date],getdate()))"),
                    DueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    SubTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiscountAmt = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    VATRate = table.Column<decimal>(type: "decimal(5,2)", nullable: true, defaultValue: 10.00m),
                    VATAmount = table.Column<decimal>(type: "decimal(29,8)", nullable: true, computedColumnSql: "(round((([SubTotal]-[DiscountAmt])*[VATRate])/(100),(0)))", stored: true),
                    TotalAmount = table.Column<decimal>(type: "decimal(30,8)", nullable: true, computedColumnSql: "(round(([SubTotal]-[DiscountAmt])*((1)+[VATRate]/(100)),(0)))", stored: true),
                    PaidAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: true, defaultValue: 0m),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "PENDING"),
                    PDFPath = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    DigitalSigned = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    VATInvoiceNo = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Invoices__D796AAD5AA6D2FEB", x => x.InvoiceID);
                    table.ForeignKey(
                        name: "FK__Invoices__Create__336AA144",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__Invoices__Custom__2CBDA3B5",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                    table.ForeignKey(
                        name: "FK__Invoices__OrderI__2BC97F7C",
                        column: x => x.OrderID,
                        principalTable: "ServiceOrders",
                        principalColumn: "OrderID");
                });

            migrationBuilder.CreateTable(
                name: "OrderLines",
                columns: table => new
                {
                    LineID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderID = table.Column<int>(type: "int", nullable: false),
                    SKUID = table.Column<int>(type: "int", nullable: true),
                    ProductDesc = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    WeightKg = table.Column<decimal>(type: "decimal(10,3)", nullable: true),
                    VolumeCBM = table.Column<decimal>(type: "decimal(8,3)", nullable: true),
                    UnitPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    LineTotal = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OrderLin__2EAE64C9F5F9A930", x => x.LineID);
                    table.ForeignKey(
                        name: "FK__OrderLine__Order__6EC0713C",
                        column: x => x.OrderID,
                        principalTable: "ServiceOrders",
                        principalColumn: "OrderID");
                    table.ForeignKey(
                        name: "FK__OrderLine__SKUID__6FB49575",
                        column: x => x.SKUID,
                        principalTable: "SKUs",
                        principalColumn: "SKUID");
                });

            migrationBuilder.CreateTable(
                name: "OutboundOrders",
                columns: table => new
                {
                    OutboundID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OutboundCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    OrderID = table.Column<int>(type: "int", nullable: false),
                    WarehouseID = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true, defaultValue: "PENDING"),
                    LabelPrinted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Outbound__35184561590B42C5", x => x.OutboundID);
                    table.ForeignKey(
                        name: "FK__OutboundO__Creat__7755B73D",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__OutboundO__Order__73852659",
                        column: x => x.OrderID,
                        principalTable: "ServiceOrders",
                        principalColumn: "OrderID");
                    table.ForeignKey(
                        name: "FK__OutboundO__Wareh__74794A92",
                        column: x => x.WarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "WarehouseID");
                });

            migrationBuilder.CreateTable(
                name: "ServiceFeedback",
                columns: table => new
                {
                    FeedbackID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerID = table.Column<int>(type: "int", nullable: false),
                    OrderID = table.Column<int>(type: "int", nullable: true),
                    StarRating = table.Column<byte>(type: "tinyint", nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ServiceF__6A4BEDF6CBB00621", x => x.FeedbackID);
                    table.ForeignKey(
                        name: "FK_Feedback_Order",
                        column: x => x.OrderID,
                        principalTable: "ServiceOrders",
                        principalColumn: "OrderID");
                    table.ForeignKey(
                        name: "FK__ServiceFe__Custo__6EF57B66",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                });

            migrationBuilder.CreateTable(
                name: "SlotBookings",
                columns: table => new
                {
                    BookingID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    QRCode = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    VehicleID = table.Column<int>(type: "int", nullable: true),
                    DriverID = table.Column<int>(type: "int", nullable: true),
                    CustomerID = table.Column<int>(type: "int", nullable: true),
                    WarehouseID = table.Column<int>(type: "int", nullable: false),
                    DockID = table.Column<int>(type: "int", nullable: true),
                    OrderID = table.Column<int>(type: "int", nullable: true),
                    BookingType = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    ScheduledDate = table.Column<DateOnly>(type: "date", nullable: false),
                    ScheduledStart = table.Column<TimeOnly>(type: "time", nullable: false),
                    ScheduledEnd = table.Column<TimeOnly>(type: "time", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "CONFIRMED"),
                    CheckInAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckOutAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    OverstayAlert = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    ALPR_Plate = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    ALPRConfidence = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    PriorityScore = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__SlotBook__73951ACD04A9DFCA", x => x.BookingID);
                    table.ForeignKey(
                        name: "FK__SlotBooki__Creat__1C873BEC",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__SlotBooki__Custo__15DA3E5D",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                    table.ForeignKey(
                        name: "FK__SlotBooki__DockI__17C286CF",
                        column: x => x.DockID,
                        principalTable: "Docks",
                        principalColumn: "DockID");
                    table.ForeignKey(
                        name: "FK__SlotBooki__Drive__14E61A24",
                        column: x => x.DriverID,
                        principalTable: "Drivers",
                        principalColumn: "DriverID");
                    table.ForeignKey(
                        name: "FK__SlotBooki__Order__18B6AB08",
                        column: x => x.OrderID,
                        principalTable: "ServiceOrders",
                        principalColumn: "OrderID");
                    table.ForeignKey(
                        name: "FK__SlotBooki__Vehic__13F1F5EB",
                        column: x => x.VehicleID,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID");
                    table.ForeignKey(
                        name: "FK__SlotBooki__Wareh__16CE6296",
                        column: x => x.WarehouseID,
                        principalTable: "Warehouses",
                        principalColumn: "WarehouseID");
                });

            migrationBuilder.CreateTable(
                name: "CargoPhotos",
                columns: table => new
                {
                    PhotoID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LineID = table.Column<int>(type: "int", nullable: false),
                    PhotoURL = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: false),
                    PhotoAngle = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    IsDamaged = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    TakenBy = table.Column<int>(type: "int", nullable: true),
                    TakenAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__CargoPho__21B7B582A343BC51", x => x.PhotoID);
                    table.ForeignKey(
                        name: "FK__CargoPhot__LineI__395884C4",
                        column: x => x.LineID,
                        principalTable: "InboundOrderLines",
                        principalColumn: "LineID");
                    table.ForeignKey(
                        name: "FK__CargoPhot__Taken__3B40CD36",
                        column: x => x.TakenBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "AdjustmentNotes",
                columns: table => new
                {
                    NoteID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NoteCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    NoteType = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: false),
                    InvoiceID = table.Column<int>(type: "int", nullable: false),
                    CustomerID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "PENDING"),
                    ApprovedBy = table.Column<int>(type: "int", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Adjustme__EACE357F1751D018", x => x.NoteID);
                    table.ForeignKey(
                        name: "FK__Adjustmen__Appro__4C364F0E",
                        column: x => x.ApprovedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__Adjustmen__Creat__4D2A7347",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__Adjustmen__Custo__4A4E069C",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                    table.ForeignKey(
                        name: "FK__Adjustmen__Invoi__4959E263",
                        column: x => x.InvoiceID,
                        principalTable: "Invoices",
                        principalColumn: "InvoiceID");
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    PaymentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    InvoiceID = table.Column<int>(type: "int", nullable: false),
                    CustomerID = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentMethod = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: true),
                    BankTxnRef = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    HashCode = table.Column<string>(type: "varchar(256)", unicode: false, maxLength: 256, nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "CONFIRMED"),
                    ReceiptPath = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    ConfirmedBy = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Payments__9B556A58E62E2FD4", x => x.PaymentID);
                    table.ForeignKey(
                        name: "FK__Payments__Confir__4589517F",
                        column: x => x.ConfirmedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__Payments__Custom__42ACE4D4",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "CustomerID");
                    table.ForeignKey(
                        name: "FK__Payments__Invoic__41B8C09B",
                        column: x => x.InvoiceID,
                        principalTable: "Invoices",
                        principalColumn: "InvoiceID");
                });

            migrationBuilder.CreateTable(
                name: "ServiceCharges",
                columns: table => new
                {
                    ChargeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ChargeCode = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    OrderID = table.Column<int>(type: "int", nullable: true),
                    InvoiceID = table.Column<int>(type: "int", nullable: true),
                    ChargeType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsApproved = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    IsAdjustment = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    OriginalChargeID = table.Column<int>(type: "int", nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ServiceC__17FC363B09E8834E", x => x.ChargeID);
                    table.ForeignKey(
                        name: "FK__ServiceCh__Creat__3CF40B7E",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__ServiceCh__Invoi__39237A9A",
                        column: x => x.InvoiceID,
                        principalTable: "Invoices",
                        principalColumn: "InvoiceID");
                    table.ForeignKey(
                        name: "FK__ServiceCh__Order__382F5661",
                        column: x => x.OrderID,
                        principalTable: "ServiceOrders",
                        principalColumn: "OrderID");
                    table.ForeignKey(
                        name: "FK__ServiceCh__Origi__3BFFE745",
                        column: x => x.OriginalChargeID,
                        principalTable: "ServiceCharges",
                        principalColumn: "ChargeID");
                });

            migrationBuilder.CreateTable(
                name: "OutboundLines",
                columns: table => new
                {
                    LineID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OutboundID = table.Column<int>(type: "int", nullable: false),
                    SKUID = table.Column<int>(type: "int", nullable: false),
                    BinID = table.Column<int>(type: "int", nullable: true),
                    RequiredQty = table.Column<int>(type: "int", nullable: false),
                    PickedQty = table.Column<int>(type: "int", nullable: true, defaultValue: 0),
                    QRLabel = table.Column<string>(type: "varchar(200)", unicode: false, maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Outbound__2EAE64C94AAD5330", x => x.LineID);
                    table.ForeignKey(
                        name: "FK__OutboundL__BinID__7D0E9093",
                        column: x => x.BinID,
                        principalTable: "WarehouseBins",
                        principalColumn: "BinID");
                    table.ForeignKey(
                        name: "FK__OutboundL__Outbo__7B264821",
                        column: x => x.OutboundID,
                        principalTable: "OutboundOrders",
                        principalColumn: "OutboundID");
                    table.ForeignKey(
                        name: "FK__OutboundL__SKUID__7C1A6C5A",
                        column: x => x.SKUID,
                        principalTable: "SKUs",
                        principalColumn: "SKUID");
                });

            migrationBuilder.CreateTable(
                name: "GateLogs",
                columns: table => new
                {
                    GateLogID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookingID = table.Column<int>(type: "int", nullable: true),
                    VehicleID = table.Column<int>(type: "int", nullable: true),
                    DriverID = table.Column<int>(type: "int", nullable: true),
                    EventType = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: false),
                    EventAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    GateCameraSnap = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    ALPR_Plate = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true),
                    ALPRConfidence = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    OperatorID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GateLogs__0DDFE410F0D91345", x => x.GateLogID);
                    table.ForeignKey(
                        name: "FK__GateLogs__Bookin__2057CCD0",
                        column: x => x.BookingID,
                        principalTable: "SlotBookings",
                        principalColumn: "BookingID");
                    table.ForeignKey(
                        name: "FK__GateLogs__Driver__22401542",
                        column: x => x.DriverID,
                        principalTable: "Drivers",
                        principalColumn: "DriverID");
                    table.ForeignKey(
                        name: "FK__GateLogs__Operat__24285DB4",
                        column: x => x.OperatorID,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK__GateLogs__Vehicl__214BF109",
                        column: x => x.VehicleID,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID");
                });

            migrationBuilder.CreateTable(
                name: "VehicleDockSessions",
                columns: table => new
                {
                    SessionID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleID = table.Column<int>(type: "int", nullable: false),
                    BookingID = table.Column<int>(type: "int", nullable: true),
                    DockID = table.Column<int>(type: "int", nullable: false),
                    CheckInTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DockStartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DockEndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CurrentStatus = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    ServiceType = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    CargoType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    LastStatusAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleDockSessions", x => x.SessionID);
                    table.ForeignKey(
                        name: "FK_VehicleDockSessions_Docks_DockID",
                        column: x => x.DockID,
                        principalTable: "Docks",
                        principalColumn: "DockID");
                    table.ForeignKey(
                        name: "FK_VehicleDockSessions_SlotBookings_BookingID",
                        column: x => x.BookingID,
                        principalTable: "SlotBookings",
                        principalColumn: "BookingID");
                    table.ForeignKey(
                        name: "FK_VehicleDockSessions_Vehicles_VehicleID",
                        column: x => x.VehicleID,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID");
                });

            migrationBuilder.CreateTable(
                name: "BankReconciliations",
                columns: table => new
                {
                    ReconcileID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BankTxnRef = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: false),
                    BankTxnDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MatchedInvoiceID = table.Column<int>(type: "int", nullable: true),
                    MatchedPaymentID = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "varchar(20)", unicode: false, maxLength: 20, nullable: true, defaultValue: "UNMATCHED"),
                    ImportedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__BankReco__1A44C406FA957507", x => x.ReconcileID);
                    table.ForeignKey(
                        name: "FK__BankRecon__Match__51EF2864",
                        column: x => x.MatchedInvoiceID,
                        principalTable: "Invoices",
                        principalColumn: "InvoiceID");
                    table.ForeignKey(
                        name: "FK__BankRecon__Match__52E34C9D",
                        column: x => x.MatchedPaymentID,
                        principalTable: "Payments",
                        principalColumn: "PaymentID");
                });

            migrationBuilder.CreateTable(
                name: "OverstayAlerts",
                columns: table => new
                {
                    AlertID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VehicleDockSessionID = table.Column<int>(type: "int", nullable: false),
                    VehicleID = table.Column<int>(type: "int", nullable: false),
                    DockID = table.Column<int>(type: "int", nullable: false),
                    SlaMinutes = table.Column<int>(type: "int", nullable: false),
                    ActualMinutes = table.Column<int>(type: "int", nullable: false),
                    OverstayMinutes = table.Column<int>(type: "int", nullable: false),
                    AlertLevel = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false),
                    AlertStatus = table.Column<string>(type: "varchar(30)", unicode: false, maxLength: 30, nullable: false, defaultValue: "OPEN"),
                    AlertMessage = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ActionTaken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ResolvedBy = table.Column<int>(type: "int", nullable: true),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastCheckedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OverstayAlerts", x => x.AlertID);
                    table.ForeignKey(
                        name: "FK_OverstayAlerts_Docks_DockID",
                        column: x => x.DockID,
                        principalTable: "Docks",
                        principalColumn: "DockID");
                    table.ForeignKey(
                        name: "FK_OverstayAlerts_Users_ResolvedBy",
                        column: x => x.ResolvedBy,
                        principalTable: "Users",
                        principalColumn: "UserID");
                    table.ForeignKey(
                        name: "FK_OverstayAlerts_VehicleDockSessions_VehicleDockSessionID",
                        column: x => x.VehicleDockSessionID,
                        principalTable: "VehicleDockSessions",
                        principalColumn: "SessionID");
                    table.ForeignKey(
                        name: "FK_OverstayAlerts_Vehicles_VehicleID",
                        column: x => x.VehicleID,
                        principalTable: "Vehicles",
                        principalColumn: "VehicleID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdjustmentNotes_ApprovedBy",
                table: "AdjustmentNotes",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AdjustmentNotes_CreatedBy",
                table: "AdjustmentNotes",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_AdjustmentNotes_CustomerID",
                table: "AdjustmentNotes",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_AdjustmentNotes_InvoiceID",
                table: "AdjustmentNotes",
                column: "InvoiceID");

            migrationBuilder.CreateIndex(
                name: "UQ__Adjustme__BAD95CB5D6BBB0B5",
                table: "AdjustmentNotes",
                column: "NoteCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AiModelTrainingLogs_TriggeredBy",
                table: "AiModelTrainingLogs",
                column: "TriggeredBy");

            migrationBuilder.CreateIndex(
                name: "IX_AIParameters_UpdatedBy",
                table: "AIParameters",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "UQ__AIParame__2A9EA4F471822F56",
                table: "AIParameters",
                column: "ParamKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuditLog_User",
                table: "AuditLog",
                columns: new[] { "UserID", "LoggedAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_MatchedInvoiceID",
                table: "BankReconciliations",
                column: "MatchedInvoiceID");

            migrationBuilder.CreateIndex(
                name: "IX_BankReconciliations_MatchedPaymentID",
                table: "BankReconciliations",
                column: "MatchedPaymentID");

            migrationBuilder.CreateIndex(
                name: "UQ__BankReco__9AF5342B4F71853F",
                table: "BankReconciliations",
                column: "BankTxnRef",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CargoPhotos_LineID",
                table: "CargoPhotos",
                column: "LineID");

            migrationBuilder.CreateIndex(
                name: "IX_CargoPhotos_TakenBy",
                table: "CargoPhotos",
                column: "TakenBy");

            migrationBuilder.CreateIndex(
                name: "UQ__CompanyP__12945A28753533DC",
                table: "CompanyProfile",
                column: "TaxCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_AssignedTo",
                table: "Complaints",
                column: "AssignedTo");

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_CustomerID",
                table: "Complaints",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Complaints_OrderID",
                table: "Complaints",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "UQ__Complain__8144A1BA72042D61",
                table: "Complaints",
                column: "ComplaintCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Customer_Tier",
                table: "Customers",
                column: "Tier");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_SLAID",
                table: "Customers",
                column: "SLAID");

            migrationBuilder.CreateIndex(
                name: "IX_Customers_UserID",
                table: "Customers",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "UQ__Customer__066785219AD29F38",
                table: "Customers",
                column: "CustomerCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Docks_WarehouseID",
                table: "Docks",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "UQ__Docks__7438A825EF84AB85",
                table: "Docks",
                column: "DockCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Drivers__0BF84B47A0DDF429",
                table: "Drivers",
                column: "DriverCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Drivers__72D7E870E2D423EC",
                table: "Drivers",
                column: "LicenseNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExceptionExpenses_ApprovedBy",
                table: "ExceptionExpenses",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ExceptionExpenses_RequestedBy",
                table: "ExceptionExpenses",
                column: "RequestedBy");

            migrationBuilder.CreateIndex(
                name: "UQ__Exceptio__5064CAE1F5BEFCDE",
                table: "ExceptionExpenses",
                column: "ExpenseCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FAQItems_CreatedBy",
                table: "FAQItems",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialForecasts_CreatedBy",
                table: "FinancialForecasts",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_FinancialForecasts_ForecastMonth",
                table: "FinancialForecasts",
                column: "ForecastMonth");

            migrationBuilder.CreateIndex(
                name: "IX_GateLog_Vehicle",
                table: "GateLogs",
                columns: new[] { "VehicleID", "EventAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_GateLogs_BookingID",
                table: "GateLogs",
                column: "BookingID");

            migrationBuilder.CreateIndex(
                name: "IX_GateLogs_DriverID",
                table: "GateLogs",
                column: "DriverID");

            migrationBuilder.CreateIndex(
                name: "IX_GateLogs_OperatorID",
                table: "GateLogs",
                column: "OperatorID");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrderLines_AISlottedBinID",
                table: "InboundOrderLines",
                column: "AISlottedBinID");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrderLines_BinID",
                table: "InboundOrderLines",
                column: "BinID");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrderLines_InboundID",
                table: "InboundOrderLines",
                column: "InboundID");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrderLines_SKUID",
                table: "InboundOrderLines",
                column: "SKUID");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrders_CreatedBy",
                table: "InboundOrders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrders_CustomerID",
                table: "InboundOrders",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_InboundOrders_WarehouseID",
                table: "InboundOrders",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "UQ__InboundO__D6CE9D26E8FF636A",
                table: "InboundOrders",
                column: "InboundCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_Bin",
                table: "Inventory",
                column: "BinID");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_SKU",
                table: "Inventory",
                column: "SKUID");

            migrationBuilder.CreateIndex(
                name: "UQ_SKU_Bin",
                table: "Inventory",
                columns: new[] { "SKUID", "BinID", "BatchNo" },
                unique: true,
                filter: "[BatchNo] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Invoice_Status",
                table: "Invoices",
                columns: new[] { "Status", "DueDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_CreatedBy",
                table: "Invoices",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_CustomerID",
                table: "Invoices",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_OrderID",
                table: "Invoices",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "UQ__Invoices__D796B227DD50CAAA",
                table: "Invoices",
                column: "InvoiceNo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_OrderID",
                table: "OrderLines",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_SKUID",
                table: "OrderLines",
                column: "SKUID");

            migrationBuilder.CreateIndex(
                name: "IX_OutboundLines_BinID",
                table: "OutboundLines",
                column: "BinID");

            migrationBuilder.CreateIndex(
                name: "IX_OutboundLines_OutboundID",
                table: "OutboundLines",
                column: "OutboundID");

            migrationBuilder.CreateIndex(
                name: "IX_OutboundLines_SKUID",
                table: "OutboundLines",
                column: "SKUID");

            migrationBuilder.CreateIndex(
                name: "IX_OutboundOrders_CreatedBy",
                table: "OutboundOrders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_OutboundOrders_OrderID",
                table: "OutboundOrders",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_OutboundOrders_WarehouseID",
                table: "OutboundOrders",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "UQ__Outbound__1E23CBD375391702",
                table: "OutboundOrders",
                column: "OutboundCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OverstayAlerts_AlertStatus_AlertLevel",
                table: "OverstayAlerts",
                columns: new[] { "AlertStatus", "AlertLevel" });

            migrationBuilder.CreateIndex(
                name: "IX_OverstayAlerts_DockID",
                table: "OverstayAlerts",
                column: "DockID");

            migrationBuilder.CreateIndex(
                name: "IX_OverstayAlerts_ResolvedBy",
                table: "OverstayAlerts",
                column: "ResolvedBy");

            migrationBuilder.CreateIndex(
                name: "IX_OverstayAlerts_VehicleDockSessionID",
                table: "OverstayAlerts",
                column: "VehicleDockSessionID");

            migrationBuilder.CreateIndex(
                name: "IX_OverstayAlerts_VehicleID",
                table: "OverstayAlerts",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ConfirmedBy",
                table: "Payments",
                column: "ConfirmedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_CustomerID",
                table: "Payments",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_InvoiceID",
                table: "Payments",
                column: "InvoiceID");

            migrationBuilder.CreateIndex(
                name: "UQ__Payments__106D3BA80953A9EB",
                table: "Payments",
                column: "PaymentCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductCategories_ParentID",
                table: "ProductCategories",
                column: "ParentID");

            migrationBuilder.CreateIndex(
                name: "UQ__ProductC__371BA955BEBC17C3",
                table: "ProductCategories",
                column: "CategoryCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Roles__D62CB59C6C88479A",
                table: "Roles",
                column: "RoleCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCharges_CreatedBy",
                table: "ServiceCharges",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCharges_InvoiceID",
                table: "ServiceCharges",
                column: "InvoiceID");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCharges_OrderID",
                table: "ServiceCharges",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCharges_OriginalChargeID",
                table: "ServiceCharges",
                column: "OriginalChargeID");

            migrationBuilder.CreateIndex(
                name: "UQ__ServiceC__3FFCA5B4F68D5770",
                table: "ServiceCharges",
                column: "ChargeCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceFeedback_CustomerID",
                table: "ServiceFeedback",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceFeedback_OrderID",
                table: "ServiceFeedback",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrder_Cust",
                table: "ServiceOrders",
                columns: new[] { "CustomerID", "CreatedAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_CreatedBy",
                table: "ServiceOrders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_SLAID",
                table: "ServiceOrders",
                column: "SLAID");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_VoucherID",
                table: "ServiceOrders",
                column: "VoucherID");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceOrders_WarehouseID",
                table: "ServiceOrders",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "UQ__ServiceO__999B52292FD2C80F",
                table: "ServiceOrders",
                column: "OrderCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SKUs_CategoryID",
                table: "SKUs",
                column: "CategoryID");

            migrationBuilder.CreateIndex(
                name: "IX_SKUs_CustomerID",
                table: "SKUs",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "UQ__SKUs__E6769AAD6517BC26",
                table: "SKUs",
                column: "SKUCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SlotBooking_Date",
                table: "SlotBookings",
                columns: new[] { "ScheduledDate", "WarehouseID" });

            migrationBuilder.CreateIndex(
                name: "IX_SlotBookings_CreatedBy",
                table: "SlotBookings",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_SlotBookings_CustomerID",
                table: "SlotBookings",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_SlotBookings_DockID",
                table: "SlotBookings",
                column: "DockID");

            migrationBuilder.CreateIndex(
                name: "IX_SlotBookings_DriverID",
                table: "SlotBookings",
                column: "DriverID");

            migrationBuilder.CreateIndex(
                name: "IX_SlotBookings_OrderID",
                table: "SlotBookings",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_SlotBookings_VehicleID",
                table: "SlotBookings",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_SlotBookings_WarehouseID",
                table: "SlotBookings",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "UQ__SlotBook__C6E56BD5968CEB62",
                table: "SlotBookings",
                column: "BookingCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockAlerts_SKUID",
                table: "StockAlerts",
                column: "SKUID");

            migrationBuilder.CreateIndex(
                name: "IX_StockLedger_BinID",
                table: "StockLedger",
                column: "BinID");

            migrationBuilder.CreateIndex(
                name: "IX_StockLedger_CreatedBy",
                table: "StockLedger",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockLedger_SKU",
                table: "StockLedger",
                columns: new[] { "SKUID", "CreatedAt" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeLines_BinID",
                table: "StocktakeLines",
                column: "BinID");

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeLines_SKUID",
                table: "StocktakeLines",
                column: "SKUID");

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeLines_StocktakeID",
                table: "StocktakeLines",
                column: "StocktakeID");

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeOrders_CreatedBy",
                table: "StocktakeOrders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StocktakeOrders_WarehouseID",
                table: "StocktakeOrders",
                column: "WarehouseID");

            migrationBuilder.CreateIndex(
                name: "UQ__Stocktak__66FC5709B341915C",
                table: "StocktakeOrders",
                column: "StocktakeCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_CreatedBy",
                table: "StockTransfers",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_FromBinID",
                table: "StockTransfers",
                column: "FromBinID");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_SKUID",
                table: "StockTransfers",
                column: "SKUID");

            migrationBuilder.CreateIndex(
                name: "IX_StockTransfers_ToBinID",
                table: "StockTransfers",
                column: "ToBinID");

            migrationBuilder.CreateIndex(
                name: "UQ__StockTra__CE99A4C54ECE3D2E",
                table: "StockTransfers",
                column: "TransferCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StockWriteOffs_ApprovedBy",
                table: "StockWriteOffs",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockWriteOffs_BinID",
                table: "StockWriteOffs",
                column: "BinID");

            migrationBuilder.CreateIndex(
                name: "IX_StockWriteOffs_CreatedBy",
                table: "StockWriteOffs",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_StockWriteOffs_SKUID",
                table: "StockWriteOffs",
                column: "SKUID");

            migrationBuilder.CreateIndex(
                name: "UQ__StockWri__5D8543DDB43D1941",
                table: "StockWriteOffs",
                column: "WriteOffCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleID",
                table: "Users",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "UQ__Users__536C85E4665A1E59",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Users__A9D105346AB00C68",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDockSessions_BookingID",
                table: "VehicleDockSessions",
                column: "BookingID");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDockSessions_CurrentStatus_DockEndTime",
                table: "VehicleDockSessions",
                columns: new[] { "CurrentStatus", "DockEndTime" });

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDockSessions_DockID_DockStartTime",
                table: "VehicleDockSessions",
                columns: new[] { "DockID", "DockStartTime" });

            migrationBuilder.CreateIndex(
                name: "IX_VehicleDockSessions_VehicleID",
                table: "VehicleDockSessions",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_VehicleMaintenanceLogs_VehicleID",
                table: "VehicleMaintenanceLogs",
                column: "VehicleID");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_CreatedBy",
                table: "Vehicles",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_DefaultDriverID",
                table: "Vehicles",
                column: "DefaultDriverID");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_Plate",
                table: "Vehicles",
                column: "TruckPlate");

            migrationBuilder.CreateIndex(
                name: "UQ__Vehicles__7E7475852470FDF2",
                table: "Vehicles",
                column: "TruckPlate",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_CustomerID",
                table: "Vouchers",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "UQ__Vouchers__7F0ABCA973C3C967",
                table: "Vouchers",
                column: "VoucherCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseBins_ShelfID",
                table: "WarehouseBins",
                column: "ShelfID");

            migrationBuilder.CreateIndex(
                name: "UQ__Warehous__6343424506A26A7C",
                table: "WarehouseBins",
                column: "BinCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UQ__Warehous__1686A0569F2F8A8B",
                table: "Warehouses",
                column: "WarehouseCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseShelves_ZoneID",
                table: "WarehouseShelves",
                column: "ZoneID");

            migrationBuilder.CreateIndex(
                name: "IX_WarehouseZones_WarehouseID",
                table: "WarehouseZones",
                column: "WarehouseID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdjustmentNotes");

            migrationBuilder.DropTable(
                name: "AiModelTrainingLogs");

            migrationBuilder.DropTable(
                name: "AIParameters");

            migrationBuilder.DropTable(
                name: "APIIntegrationLogs");

            migrationBuilder.DropTable(
                name: "AuditLog");

            migrationBuilder.DropTable(
                name: "BankReconciliations");

            migrationBuilder.DropTable(
                name: "CargoPhotos");

            migrationBuilder.DropTable(
                name: "CompanyProfile");

            migrationBuilder.DropTable(
                name: "Complaints");

            migrationBuilder.DropTable(
                name: "DebtTermConfigs");

            migrationBuilder.DropTable(
                name: "ExceptionExpenses");

            migrationBuilder.DropTable(
                name: "FAQItems");

            migrationBuilder.DropTable(
                name: "FinancialForecasts");

            migrationBuilder.DropTable(
                name: "GateLogs");

            migrationBuilder.DropTable(
                name: "Inventory");

            migrationBuilder.DropTable(
                name: "MasterCategory");

            migrationBuilder.DropTable(
                name: "NotificationConfigs");

            migrationBuilder.DropTable(
                name: "OrderLines");

            migrationBuilder.DropTable(
                name: "OutboundLines");

            migrationBuilder.DropTable(
                name: "OverstayAlerts");

            migrationBuilder.DropTable(
                name: "PriceConfig");

            migrationBuilder.DropTable(
                name: "ServiceCharges");

            migrationBuilder.DropTable(
                name: "ServiceFeedback");

            migrationBuilder.DropTable(
                name: "StockAlerts");

            migrationBuilder.DropTable(
                name: "StockLedger");

            migrationBuilder.DropTable(
                name: "StocktakeLines");

            migrationBuilder.DropTable(
                name: "StockTransfers");

            migrationBuilder.DropTable(
                name: "StockWriteOffs");

            migrationBuilder.DropTable(
                name: "VehicleMaintenanceLogs");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropTable(
                name: "InboundOrderLines");

            migrationBuilder.DropTable(
                name: "OutboundOrders");

            migrationBuilder.DropTable(
                name: "VehicleDockSessions");

            migrationBuilder.DropTable(
                name: "StocktakeOrders");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "WarehouseBins");

            migrationBuilder.DropTable(
                name: "InboundOrders");

            migrationBuilder.DropTable(
                name: "SKUs");

            migrationBuilder.DropTable(
                name: "SlotBookings");

            migrationBuilder.DropTable(
                name: "WarehouseShelves");

            migrationBuilder.DropTable(
                name: "ProductCategories");

            migrationBuilder.DropTable(
                name: "Docks");

            migrationBuilder.DropTable(
                name: "ServiceOrders");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.DropTable(
                name: "WarehouseZones");

            migrationBuilder.DropTable(
                name: "Vouchers");

            migrationBuilder.DropTable(
                name: "Drivers");

            migrationBuilder.DropTable(
                name: "Warehouses");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "SLAConfig");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
