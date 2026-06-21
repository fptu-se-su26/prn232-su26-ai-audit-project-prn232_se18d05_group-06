-- ============================================================
--  SmartLog AI – Hệ thống Quản trị Logistics Thông minh
--  SQL Server Database Schema + Sample Data
--  Version: 1.0 | Date: 2026
-- ============================================================
 
USE master;
GO
 
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'SmartLogAI')
    DROP DATABASE SmartLogAI;
GO
 
CREATE DATABASE SmartLogAI
    COLLATE Vietnamese_CI_AS;
GO
 
USE SmartLogAI;
GO
 
-- ============================================================
-- MODULE 5: HỆ THỐNG & CẤU HÌNH (Base tables – needed first)
-- ============================================================
 
-- Thông tin doanh nghiệp (UC056)
CREATE TABLE CompanyProfile (
    CompanyID       INT PRIMARY KEY IDENTITY(1,1),
    CompanyName     NVARCHAR(200)   NOT NULL,
    TaxCode         VARCHAR(20)     NOT NULL UNIQUE,
    Address         NVARCHAR(500),
    Phone           VARCHAR(20),
    Email           VARCHAR(100),
    Website         VARCHAR(200),
    Logo_URL        VARCHAR(500),
    DigitalSignPath VARCHAR(500),
    CreatedAt       DATETIME2       DEFAULT GETDATE(),
    UpdatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Danh mục dùng chung – đơn vị, loại hàng, tiền tệ (UC054)
CREATE TABLE MasterCategory (
    CategoryID      INT PRIMARY KEY IDENTITY(1,1),
    CategoryType    VARCHAR(50)     NOT NULL,   -- 'CURRENCY','UNIT','CARGO_TYPE','ZONE_TYPE'
    Code            VARCHAR(50)     NOT NULL,
    NameVN          NVARCHAR(200)   NOT NULL,
    NameEN          VARCHAR(200),
    SortOrder       INT             DEFAULT 0,
    IsActive        BIT             DEFAULT 1
);
 
-- Cấu hình giá cước & phụ phí (UC049)
CREATE TABLE PriceConfig (
    PriceID         INT PRIMARY KEY IDENTITY(1,1),
    ServiceType     NVARCHAR(100)   NOT NULL,
    Zone            NVARCHAR(100),
    BasePrice       DECIMAL(18,2)   NOT NULL,
    Unit            VARCHAR(20),    -- 'CBM','TON','PALLET','TRIP'
    SurchargeType   NVARCHAR(100),
    SurchargeValue  DECIMAL(18,2)   DEFAULT 0,
    EffectiveFrom   DATE            NOT NULL,
    EffectiveTo     DATE,
    IsActive        BIT             DEFAULT 1,
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Cấu hình SLA (UC034)
CREATE TABLE SLAConfig (
    SLAID           INT PRIMARY KEY IDENTITY(1,1),
    PartnerTier     VARCHAR(20)     NOT NULL,   -- 'STANDARD','PREMIUM','ENTERPRISE'
    MaxWaitHours    INT             NOT NULL,
    MaxDockhours    INT             NOT NULL,
    CompensationPct DECIMAL(5,2)   DEFAULT 0,
    Description     NVARCHAR(500),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- ============================================================
-- MODULE 5: PHÂN QUYỀN & NGƯỜI DÙNG (UC048)
-- ============================================================
 
CREATE TABLE Roles (
    RoleID          INT PRIMARY KEY IDENTITY(1,1),
    RoleCode        VARCHAR(20)     NOT NULL UNIQUE, -- 'ADMIN','WF','DISPATCHER','CUSTOMER'
    RoleName        NVARCHAR(100)   NOT NULL,
    Description     NVARCHAR(500),
    IsActive        BIT             DEFAULT 1
);
 
CREATE TABLE Users (
    UserID          INT PRIMARY KEY IDENTITY(1,1),
    Username        VARCHAR(100)    NOT NULL UNIQUE,
    PasswordHash    VARCHAR(256)    NOT NULL,
    FullName        NVARCHAR(200)   NOT NULL,
    Email           VARCHAR(150)    NOT NULL UNIQUE,
    Phone           VARCHAR(20),
    RoleID          INT             NOT NULL REFERENCES Roles(RoleID),
    IsActive        BIT             DEFAULT 1,
    LastLoginAt     DATETIME2,
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Audit Log bất biến (UC048)
CREATE TABLE AuditLog (
    LogID           BIGINT PRIMARY KEY IDENTITY(1,1),
    UserID          INT             REFERENCES Users(UserID),
    IPAddress       VARCHAR(50),
    Action          VARCHAR(100)    NOT NULL,
    TableName       VARCHAR(100),
    RecordID        VARCHAR(50),
    OldValue        NVARCHAR(MAX),
    NewValue        NVARCHAR(MAX),
    LoggedAt        DATETIME2       DEFAULT GETDATE()
);
 
-- ============================================================
-- MODULE 3: KHÁCH HÀNG & CRM (UC029, UC030, UC031)
-- ============================================================
 
CREATE TABLE Customers (
    CustomerID      INT PRIMARY KEY IDENTITY(1,1),
    CustomerCode    VARCHAR(20)     NOT NULL UNIQUE,
    CompanyName     NVARCHAR(200)   NOT NULL,
    ContactName     NVARCHAR(100),
    Email           VARCHAR(150)    NOT NULL,
    Phone           VARCHAR(20),
    Address         NVARCHAR(500),
    TaxCode         VARCHAR(20),
    Tier            VARCHAR(10)     DEFAULT 'BRONZE',  -- 'BRONZE','SILVER','GOLD'
    TierUpdatedAt   DATE,
    TotalOrders12M  INT             DEFAULT 0,
    TierGraceTo     DATE,           -- Ân hạn 30 ngày khi sụt hạng (UC029)
    SLAID           INT             REFERENCES SLAConfig(SLAID),
    UserID          INT             REFERENCES Users(UserID),
    IsActive        BIT             DEFAULT 1,
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Voucher giảm giá (UC030)
CREATE TABLE Vouchers (
    VoucherID       INT PRIMARY KEY IDENTITY(1,1),
    VoucherCode     VARCHAR(50)     NOT NULL UNIQUE,
    CustomerTier    VARCHAR(10),
    CustomerID      INT             REFERENCES Customers(CustomerID),
    DiscountPct     DECIMAL(5,2)   DEFAULT 0,
    DiscountAmount  DECIMAL(18,2)  DEFAULT 0,
    MinOrderValue   DECIMAL(18,2)  DEFAULT 0,
    ValidFrom       DATE            NOT NULL,
    ValidTo         DATE            NOT NULL,
    IsUsed          BIT             DEFAULT 0,
    UsedAt          DATETIME2,
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Khiếu nại (UC031)
CREATE TABLE Complaints (
    ComplaintID     INT PRIMARY KEY IDENTITY(1,1),
    ComplaintCode   VARCHAR(20)     NOT NULL UNIQUE,
    CustomerID      INT             NOT NULL REFERENCES Customers(CustomerID),
    OrderID         INT,            -- FK added later
    ComplaintType   VARCHAR(50),    -- 'DAMAGED','LATE_DELIVERY','LOST','OTHER'
    Description     NVARCHAR(1000),
    Status          VARCHAR(30)     DEFAULT 'OPEN',  -- 'OPEN','IN_PROGRESS','RESOLVED','CLOSED'
    AssignedTo      INT             REFERENCES Users(UserID),
    ResolvedAt      DATETIME2,
    ResolutionNote  NVARCHAR(1000),
    CreatedAt       DATETIME2       DEFAULT GETDATE(),
    DeadlineAt      DATETIME2       -- 7 ngày từ khi nhận (UC031)
);
 
-- Feedback đánh giá (UC036)
CREATE TABLE ServiceFeedback (
    FeedbackID      INT PRIMARY KEY IDENTITY(1,1),
    CustomerID      INT             NOT NULL REFERENCES Customers(CustomerID),
    OrderID         INT,
    StarRating      TINYINT         CHECK(StarRating BETWEEN 1 AND 5),
    Comment         NVARCHAR(1000),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- ============================================================
-- MODULE 1: KHO HÀNG – CẤU TRÚC VẬT LÝ (UC008)
-- ============================================================
 
CREATE TABLE Warehouses (
    WarehouseID     INT PRIMARY KEY IDENTITY(1,1),
    WarehouseCode   VARCHAR(20)     NOT NULL UNIQUE,
    WarehouseName   NVARCHAR(200)   NOT NULL,
    Address         NVARCHAR(500),
    TotalCapacity   DECIMAL(10,2),  -- m²
    IsActive        BIT             DEFAULT 1,
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Zone / khu vực kho
CREATE TABLE WarehouseZones (
    ZoneID          INT PRIMARY KEY IDENTITY(1,1),
    WarehouseID     INT             NOT NULL REFERENCES Warehouses(WarehouseID),
    ZoneCode        VARCHAR(20)     NOT NULL,
    ZoneName        NVARCHAR(100)   NOT NULL,
    ZoneType        VARCHAR(30),    -- 'NORMAL','COLD','HAZMAT','HEAVY'
    Capacity        DECIMAL(10,2),
    IsActive        BIT             DEFAULT 1
);
 
-- Dãy kệ (Row/Shelf)
CREATE TABLE WarehouseShelves (
    ShelfID         INT PRIMARY KEY IDENTITY(1,1),
    ZoneID          INT             NOT NULL REFERENCES WarehouseZones(ZoneID),
    ShelfCode       VARCHAR(20)     NOT NULL,
    FloorLevel      TINYINT         DEFAULT 1,    -- Tầng kệ
    MaxWeightKg     DECIMAL(10,2),
    IsActive        BIT             DEFAULT 1
);
 
-- Ô chứa - Bin (UC008)
CREATE TABLE WarehouseBins (
    BinID           INT PRIMARY KEY IDENTITY(1,1),
    ShelfID         INT             NOT NULL REFERENCES WarehouseShelves(ShelfID),
    BinCode         VARCHAR(30)     NOT NULL UNIQUE,
    BinType         VARCHAR(30),    -- 'STANDARD','COLD','HAZMAT'
    CapacityCBM     DECIMAL(8,3),
    MaxWeightKg     DECIMAL(10,2),
    IsOccupied      BIT             DEFAULT 0,
    IsActive        BIT             DEFAULT 1
);
 
-- Dock – cửa bốc dỡ hàng
CREATE TABLE Docks (
    DockID          INT PRIMARY KEY IDENTITY(1,1),
    WarehouseID     INT             NOT NULL REFERENCES Warehouses(WarehouseID),
    DockCode        VARCHAR(20)     NOT NULL UNIQUE,
    DockName        NVARCHAR(100),
    Status          VARCHAR(20)     DEFAULT 'AVAILABLE', -- 'AVAILABLE','OCCUPIED','MAINTENANCE'
    MaxTruckLength  DECIMAL(5,2),
    IsActive        BIT             DEFAULT 1
);
 
-- ============================================================
-- MODULE 1: DANH MỤC HÀNG HÓA & SKU (UC012)
-- ============================================================
 
CREATE TABLE ProductCategories (
    CategoryID      INT PRIMARY KEY IDENTITY(1,1),
    ParentID        INT             REFERENCES ProductCategories(CategoryID),
    CategoryCode    VARCHAR(20)     NOT NULL UNIQUE,
    CategoryName    NVARCHAR(200)   NOT NULL,
    IsActive        BIT             DEFAULT 1
);
 
CREATE TABLE SKUs (
    SKUID           INT PRIMARY KEY IDENTITY(1,1),
    SKUCode         VARCHAR(50)     NOT NULL UNIQUE,
    Barcode         VARCHAR(100),
    QRCode          VARCHAR(200),
    ProductName     NVARCHAR(300)   NOT NULL,
    CategoryID      INT             REFERENCES ProductCategories(CategoryID),
    CustomerID      INT             REFERENCES Customers(CustomerID),
    WeightKg        DECIMAL(10,3),
    LengthCm        DECIMAL(8,2),
    WidthCm         DECIMAL(8,2),
    HeightCm        DECIMAL(8,2),
    VolumeCBM       AS (ROUND((LengthCm * WidthCm * HeightCm) / 1000000.0, 6)) PERSISTED,
    StorageTemp     VARCHAR(20),    -- 'AMBIENT','COLD','FROZEN'
    IsFragile       BIT             DEFAULT 0,
    IsHazmat        BIT             DEFAULT 0,
    IsHeavy         BIT             DEFAULT 0,
    SafetyMinQty    INT             DEFAULT 0,
    SafetyDebounceH INT             DEFAULT 12,
    ExpiryDays      INT,
    IsActive        BIT             DEFAULT 1,
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Tồn kho theo Bin (UC001, UC005)
CREATE TABLE Inventory (
    InventoryID     INT PRIMARY KEY IDENTITY(1,1),
    SKUID           INT             NOT NULL REFERENCES SKUs(SKUID),
    BinID           INT             NOT NULL REFERENCES WarehouseBins(BinID),
    Quantity        INT             NOT NULL DEFAULT 0,
    BatchNo         VARCHAR(50),
    ExpiryDate      DATE,
    InboundDate     DATE            DEFAULT CAST(GETDATE() AS DATE),
    LastCountDate   DATE,
    CONSTRAINT UQ_SKU_Bin UNIQUE (SKUID, BinID, BatchNo)
);
 
-- Stock Ledger – lịch sử thẻ kho bất biến (UC011)
CREATE TABLE StockLedger (
    LedgerID        BIGINT PRIMARY KEY IDENTITY(1,1),
    SKUID           INT             NOT NULL REFERENCES SKUs(SKUID),
    BinID           INT             REFERENCES WarehouseBins(BinID),
    TxnType         VARCHAR(30)     NOT NULL, -- 'INBOUND','OUTBOUND','TRANSFER_IN','TRANSFER_OUT','WRITEOFF','ADJUSTMENT'
    Qty             INT             NOT NULL,
    QtyBefore       INT             NOT NULL,
    QtyAfter        INT             NOT NULL,
    RefType         VARCHAR(30),    -- 'INBOUND_ORDER','OUTBOUND_ORDER','STOCKTAKE'
    RefID           INT,
    Note            NVARCHAR(500),
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- ============================================================
-- MODULE 1: NHẬP KHO & KIỂM KÊ (UC001–UC003, UC009, UC010)
-- ============================================================
 
-- Đơn nhập kho
CREATE TABLE InboundOrders (
    InboundID       INT PRIMARY KEY IDENTITY(1,1),
    InboundCode     VARCHAR(30)     NOT NULL UNIQUE,
    CustomerID      INT             NOT NULL REFERENCES Customers(CustomerID),
    WarehouseID     INT             NOT NULL REFERENCES Warehouses(WarehouseID),
    ExpectedDate    DATE,
    ActualDate      DATE,
    Status          VARCHAR(30)     DEFAULT 'PENDING', -- 'PENDING','IN_PROGRESS','COMPLETED','CANCELLED'
    OCRConfidence   DECIMAL(5,2),   -- % độ tin cậy AI OCR (UC001)
    OCRRawData      NVARCHAR(MAX),
    RequireManual   BIT             DEFAULT 0, -- Cảnh báo khi OCR < 85%
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Chi tiết nhập kho
CREATE TABLE InboundOrderLines (
    LineID          INT PRIMARY KEY IDENTITY(1,1),
    InboundID       INT             NOT NULL REFERENCES InboundOrders(InboundID),
    SKUID           INT             NOT NULL REFERENCES SKUs(SKUID),
    ExpectedQty     INT             NOT NULL,
    ReceivedQty     INT             DEFAULT 0,
    BinID           INT             REFERENCES WarehouseBins(BinID),
    AISlottedBinID  INT             REFERENCES WarehouseBins(BinID), -- Gợi ý AI (UC005)
    BatchNo         VARCHAR(50),
    ExpiryDate      DATE,
    ConditionStatus VARCHAR(30)     DEFAULT 'GOOD', -- 'GOOD','DAMAGED','PARTIAL'
    Note            NVARCHAR(500)
);
 
-- Ảnh tình trạng hàng nhập (UC002)
CREATE TABLE CargoPhotos (
    PhotoID         INT PRIMARY KEY IDENTITY(1,1),
    LineID          INT             NOT NULL REFERENCES InboundOrderLines(LineID),
    PhotoURL        VARCHAR(500)    NOT NULL,
    PhotoAngle      VARCHAR(50),    -- 'FRONT','SIDE','TOP','DETAIL'
    IsDamaged       BIT             DEFAULT 0,
    TakenBy         INT             REFERENCES Users(UserID),
    TakenAt         DATETIME2       DEFAULT GETDATE()
);
 
-- Phiếu kiểm kê (UC003)
CREATE TABLE StocktakeOrders (
    StocktakeID     INT PRIMARY KEY IDENTITY(1,1),
    StocktakeCode   VARCHAR(30)     NOT NULL UNIQUE,
    WarehouseID     INT             NOT NULL REFERENCES Warehouses(WarehouseID),
    StocktakeDate   DATE            NOT NULL,
    Status          VARCHAR(20)     DEFAULT 'DRAFT', -- 'DRAFT','IN_PROGRESS','COMPLETED'
    VarianceAlert   BIT             DEFAULT 0,
    CreatedBy       INT             REFERENCES Users(UserID),
    CompletedAt     DATETIME2
);
 
-- Chi tiết kiểm kê
CREATE TABLE StocktakeLines (
    LineID          INT PRIMARY KEY IDENTITY(1,1),
    StocktakeID     INT             NOT NULL REFERENCES StocktakeOrders(StocktakeID),
    SKUID           INT             NOT NULL REFERENCES SKUs(SKUID),
    BinID           INT             REFERENCES WarehouseBins(BinID),
    SystemQty       INT             NOT NULL,
    CountedQty      INT,
    Variance        AS (CountedQty - SystemQty) PERSISTED,
    VariancePct     AS (CASE WHEN SystemQty = 0 THEN NULL
                             ELSE CAST((CountedQty - SystemQty) * 100.0 / SystemQty AS DECIMAL(8,2))
                        END) PERSISTED,
    RequireRecount  BIT             DEFAULT 0,  -- Lệch > 10% (UC003)
    Note            NVARCHAR(500)
);
 
-- Lệnh chuyển kho nội bộ (UC009)
CREATE TABLE StockTransfers (
    TransferID      INT PRIMARY KEY IDENTITY(1,1),
    TransferCode    VARCHAR(30)     NOT NULL UNIQUE,
    SKUID           INT             NOT NULL REFERENCES SKUs(SKUID),
    FromBinID       INT             NOT NULL REFERENCES WarehouseBins(BinID),
    ToBinID         INT             NOT NULL REFERENCES WarehouseBins(BinID),
    Quantity        INT             NOT NULL,
    Status          VARCHAR(20)     DEFAULT 'PENDING', -- 'PENDING','COMPLETED'
    CreatedBy       INT             REFERENCES Users(UserID),
    CompletedAt     DATETIME2,
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Phiếu thanh lý hàng hỏng (UC010)
CREATE TABLE StockWriteOffs (
    WriteOffID      INT PRIMARY KEY IDENTITY(1,1),
    WriteOffCode    VARCHAR(30)     NOT NULL UNIQUE,
    SKUID           INT             NOT NULL REFERENCES SKUs(SKUID),
    BinID           INT             REFERENCES WarehouseBins(BinID),
    Quantity        INT             NOT NULL,
    Reason          NVARCHAR(500),
    Status          VARCHAR(20)     DEFAULT 'PENDING', -- 'PENDING','APPROVED','REJECTED'
    ApprovedBy      INT             REFERENCES Users(UserID),
    ApprovedAt      DATETIME2,
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Cảnh báo tồn kho (UC006)
CREATE TABLE StockAlerts (
    AlertID         INT PRIMARY KEY IDENTITY(1,1),
    SKUID           INT             NOT NULL REFERENCES SKUs(SKUID),
    AlertType       VARCHAR(30)     NOT NULL, -- 'LOW_STOCK','EXPIRY_SOON','DEAD_STOCK'
    CurrentQty      INT,
    ThresholdQty    INT,
    EmailSentAt     DATETIME2,
    NextAllowedAt   DATETIME2,  -- Debounce 12 giờ
    IsResolved      BIT             DEFAULT 0,
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- ============================================================
-- MODULE 3: ĐƠN HÀNG DỊCH VỤ LOGISTICS (UC027)
-- ============================================================
 
CREATE TABLE ServiceOrders (
    OrderID         INT PRIMARY KEY IDENTITY(1,1),
    OrderCode       VARCHAR(30)     NOT NULL UNIQUE,
    CustomerID      INT             NOT NULL REFERENCES Customers(CustomerID),
    WarehouseID     INT             NOT NULL REFERENCES Warehouses(WarehouseID),
    ServiceType     VARCHAR(50)     NOT NULL, -- 'IMPORT','EXPORT','STORAGE','TRANSPORT'
    PickupAddress   NVARCHAR(500),
    DeliveryAddress NVARCHAR(500),
    PickupLat       DECIMAL(10,7),
    PickupLng       DECIMAL(10,7),
    DeliveryLat     DECIMAL(10,7),
    DeliveryLng     DECIMAL(10,7),
    TotalWeightKg   DECIMAL(12,3),
    TotalCBM        DECIMAL(10,3),
    TotalPallets    INT             DEFAULT 0,
    EstimatedCost   DECIMAL(18,2),
    VoucherID       INT             REFERENCES Vouchers(VoucherID),
    DiscountAmount  DECIMAL(18,2)   DEFAULT 0,
    FinalCost       DECIMAL(18,2),
    Status          VARCHAR(30)     DEFAULT 'DRAFT',
    -- 'DRAFT','CONFIRMED','PICKING','IN_STORAGE','DISPATCHED','DELIVERED','CANCELLED'
    Priority        VARCHAR(20)     DEFAULT 'NORMAL', -- 'NORMAL','URGENT','PERISHABLE'
    PriorityScore   INT             DEFAULT 0,        -- Điểm ưu tiên điều phối (UC026)
    SLAID           INT             REFERENCES SLAConfig(SLAID),
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE(),
    ConfirmedAt     DATETIME2,
    DeliveredAt     DATETIME2
);
 
-- Chi tiết hàng trong đơn
CREATE TABLE OrderLines (
    LineID          INT PRIMARY KEY IDENTITY(1,1),
    OrderID         INT             NOT NULL REFERENCES ServiceOrders(OrderID),
    SKUID           INT             REFERENCES SKUs(SKUID),
    ProductDesc     NVARCHAR(300),
    Quantity        INT             NOT NULL,
    WeightKg        DECIMAL(10,3),
    VolumeCBM       DECIMAL(8,3),
    UnitPrice       DECIMAL(18,2),
    LineTotal       DECIMAL(18,2)
);
 
-- Lệnh xuất kho (UC004)
CREATE TABLE OutboundOrders (
    OutboundID      INT PRIMARY KEY IDENTITY(1,1),
    OutboundCode    VARCHAR(30)     NOT NULL UNIQUE,
    OrderID         INT             NOT NULL REFERENCES ServiceOrders(OrderID),
    WarehouseID     INT             NOT NULL REFERENCES Warehouses(WarehouseID),
    Status          VARCHAR(30)     DEFAULT 'PENDING',
    -- 'PENDING','PICKING','PACKED','DISPATCHED'
    LabelPrinted    BIT             DEFAULT 0,
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE(),
    CompletedAt     DATETIME2
);
 
-- Picking list chi tiết
CREATE TABLE OutboundLines (
    LineID          INT PRIMARY KEY IDENTITY(1,1),
    OutboundID      INT             NOT NULL REFERENCES OutboundOrders(OutboundID),
    SKUID           INT             NOT NULL REFERENCES SKUs(SKUID),
    BinID           INT             REFERENCES WarehouseBins(BinID),
    RequiredQty     INT             NOT NULL,
    PickedQty       INT             DEFAULT 0,
    QRLabel         VARCHAR(200)
);
 
-- FK ngược cho Complaints
ALTER TABLE Complaints ADD CONSTRAINT FK_Complaint_Order
    FOREIGN KEY (OrderID) REFERENCES ServiceOrders(OrderID);
ALTER TABLE ServiceFeedback ADD CONSTRAINT FK_Feedback_Order
    FOREIGN KEY (OrderID) REFERENCES ServiceOrders(OrderID);
 
-- ============================================================
-- MODULE 2: PHƯƠNG TIỆN & LỊCH XE (UC013–UC024)
-- ============================================================
 
CREATE TABLE Drivers (
    DriverID        INT PRIMARY KEY IDENTITY(1,1),
    DriverCode      VARCHAR(20)     NOT NULL UNIQUE,
    FullName        NVARCHAR(200)   NOT NULL,
    Phone           VARCHAR(20),
    LicenseNo       VARCHAR(50)     NOT NULL UNIQUE,
    LicenseExpiry   DATE,
    IsBlacklisted   BIT             DEFAULT 0,
    BlacklistReason NVARCHAR(500),
    IsActive        BIT             DEFAULT 1,
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Hồ sơ phương tiện (UC013)
CREATE TABLE Vehicles (
    VehicleID       INT PRIMARY KEY IDENTITY(1,1),
    TruckPlate      VARCHAR(20)     NOT NULL UNIQUE,  -- Đầu kéo
    TrailerPlate    VARCHAR(20),                       -- Rơ-moóc
    VehicleType     VARCHAR(50),    -- 'CONTAINER_20','CONTAINER_40','TRUCK','VAN'
    MaxWeightTon    DECIMAL(8,2),
    OwnerName       NVARCHAR(200),
    OwnerPhone      VARCHAR(20),
    IsInternal      BIT             DEFAULT 0,
    DefaultDriverID INT             REFERENCES Drivers(DriverID),
    InspectionExpiry DATE,          -- Đăng kiểm (UC024)
    NextServiceDate  DATE,
    GPSDeviceID     VARCHAR(50),    -- UC022
    IsBlacklisted   BIT             DEFAULT 0,  -- UC021
    BlacklistReason NVARCHAR(500),
    Status          VARCHAR(20)     DEFAULT 'ACTIVE',
    -- 'ACTIVE','PENDING_APPROVAL','BLACKLISTED','INACTIVE'
    IsTempProfile   BIT             DEFAULT 0,  -- Tự động tạo khi xe lạ (UC015)
    TempExpiryAt    DATETIME2,      -- Xóa sau 7 ngày nếu không duyệt
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Lịch đặt slot xe (UC016)
CREATE TABLE SlotBookings (
    BookingID       INT PRIMARY KEY IDENTITY(1,1),
    BookingCode     VARCHAR(30)     NOT NULL UNIQUE,
    QRCode          VARCHAR(500),
    VehicleID       INT             REFERENCES Vehicles(VehicleID),
    DriverID        INT             REFERENCES Drivers(DriverID),
    CustomerID      INT             REFERENCES Customers(CustomerID),
    WarehouseID     INT             NOT NULL REFERENCES Warehouses(WarehouseID),
    DockID          INT             REFERENCES Docks(DockID),      -- UC025 AI Dispatch
    OrderID         INT             REFERENCES ServiceOrders(OrderID),
    BookingType     VARCHAR(20)     NOT NULL, -- 'INBOUND','OUTBOUND'
    ScheduledDate   DATE            NOT NULL,
    ScheduledStart  TIME            NOT NULL,
    ScheduledEnd    TIME            NOT NULL,
    Status          VARCHAR(20)     DEFAULT 'CONFIRMED',
    -- 'CONFIRMED','CHECKED_IN','IN_DOCK','COMPLETED','CANCELLED','NO_SHOW'
    CheckInAt       DATETIME2,
    CheckOutAt      DATETIME2,
    OverstayAlert   BIT             DEFAULT 0,  -- UC023
    ALPR_Plate      VARCHAR(20),    -- Biển số nhận diện thực tế (UC014)
    ALPRConfidence  DECIMAL(5,2),
    PriorityScore   INT             DEFAULT 0,  -- UC026
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Lịch sử vào/ra cổng bất biến (UC018)
CREATE TABLE GateLogs (
    GateLogID       BIGINT PRIMARY KEY IDENTITY(1,1),
    BookingID       INT             REFERENCES SlotBookings(BookingID),
    VehicleID       INT             REFERENCES Vehicles(VehicleID),
    DriverID        INT             REFERENCES Drivers(DriverID),
    EventType       VARCHAR(20)     NOT NULL,   -- 'CHECKIN','CHECKOUT'
    EventAt         DATETIME2       DEFAULT GETDATE(),
    GateCameraSnap  VARCHAR(500),   -- URL ảnh chụp từ camera
    ALPR_Plate      VARCHAR(20),
    ALPRConfidence  DECIMAL(5,2),
    OperatorID      INT             REFERENCES Users(UserID)
    -- NOTE: No UPDATE/DELETE allowed on this table (immutable log)
);

-- Lịch sử hành trình xe - Sự kiện xe (UC018)
CREATE TABLE VehicleEvents (
    EventID         INT PRIMARY KEY IDENTITY(1,1),
    VehicleID       INT             NOT NULL REFERENCES Vehicles(VehicleID),
    EventType       VARCHAR(20)     NOT NULL CHECK (EventType IN ('CheckIn', 'CheckOut', 'Load', 'Unload')),
    EventTime       DATETIME2       NOT NULL DEFAULT GETDATE(),
    Remarks         NVARCHAR(500)   NULL
);

-- Lịch bảo trì xe (UC024)
CREATE TABLE VehicleMaintenanceLogs (
    MaintenanceID   INT PRIMARY KEY IDENTITY(1,1),
    VehicleID       INT             NOT NULL REFERENCES Vehicles(VehicleID),
    MaintenanceType VARCHAR(50),    -- 'PERIODIC','INSPECTION','REPAIR'
    ServiceDate     DATE            NOT NULL,
    NextServiceDate DATE,
    ServiceCenter   NVARCHAR(200),
    CostAmount      DECIMAL(18,2),
    Note            NVARCHAR(500),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- ============================================================
-- MODULE 4: TÀI CHÍNH & ĐỐI SOÁT (UC037–UC047)
-- ============================================================
 
-- Hóa đơn (UC037)
CREATE TABLE Invoices (
    InvoiceID       INT PRIMARY KEY IDENTITY(1,1),
    InvoiceNo       VARCHAR(30)     NOT NULL UNIQUE,
    OrderID         INT             NOT NULL REFERENCES ServiceOrders(OrderID),
    CustomerID      INT             NOT NULL REFERENCES Customers(CustomerID),
    IssueDate       DATE            NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    DueDate         DATE            NOT NULL,
    SubTotal        DECIMAL(18,2)   NOT NULL,
    DiscountAmt     DECIMAL(18,2)   DEFAULT 0,
    VATRate         DECIMAL(5,2)    DEFAULT 10.00,
    VATAmount       AS (ROUND((SubTotal - DiscountAmt) * VATRate / 100, 0)) PERSISTED,
    TotalAmount     AS (ROUND((SubTotal - DiscountAmt) * (1 + VATRate / 100), 0)) PERSISTED,
    PaidAmount      DECIMAL(18,2)   DEFAULT 0,
    Status          VARCHAR(20)     DEFAULT 'PENDING',  -- 'PENDING','PARTIAL','PAID','OVERDUE'
    PDFPath         VARCHAR(500),
    DigitalSigned   BIT             DEFAULT 0,
    VATInvoiceNo    VARCHAR(50),    -- Mã hóa đơn điện tử VAT (UC046)
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Phiếu chi phí dịch vụ (UC038)
CREATE TABLE ServiceCharges (
    ChargeID        INT PRIMARY KEY IDENTITY(1,1),
    ChargeCode      VARCHAR(30)     NOT NULL UNIQUE,
    OrderID         INT             REFERENCES ServiceOrders(OrderID),
    InvoiceID       INT             REFERENCES Invoices(InvoiceID),
    ChargeType      NVARCHAR(100)   NOT NULL, -- 'STORAGE','LOADING','COLD_PLUG','EXTRA'
    Description     NVARCHAR(500),
    Amount          DECIMAL(18,2)   NOT NULL,
    IsApproved      BIT             DEFAULT 0,
    IsAdjustment    BIT             DEFAULT 0,  -- Phiếu điều chỉnh (UC038)
    OriginalChargeID INT            REFERENCES ServiceCharges(ChargeID),
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Phiếu thu tiền / thanh toán (UC039, UC040)
CREATE TABLE Payments (
    PaymentID       INT PRIMARY KEY IDENTITY(1,1),
    PaymentCode     VARCHAR(30)     NOT NULL UNIQUE,
    InvoiceID       INT             NOT NULL REFERENCES Invoices(InvoiceID),
    CustomerID      INT             NOT NULL REFERENCES Customers(CustomerID),
    Amount          DECIMAL(18,2)   NOT NULL,
    PaymentMethod   VARCHAR(30),    -- 'BANK_TRANSFER','CASH','CREDIT'
    BankTxnRef      VARCHAR(100),   -- Mã giao dịch ngân hàng
    HashCode        VARCHAR(256),   -- SHA256 chống gian lận (UC040)
    Status          VARCHAR(20)     DEFAULT 'CONFIRMED', -- 'CONFIRMED','CANCELLED'
    ReceiptPath     VARCHAR(500),   -- E-Receipt PDF
    PaidAt          DATETIME2       DEFAULT GETDATE(),
    ConfirmedBy     INT             REFERENCES Users(UserID)
);
 
-- Credit/Debit Note điều chỉnh công nợ (UC043)
CREATE TABLE AdjustmentNotes (
    NoteID          INT PRIMARY KEY IDENTITY(1,1),
    NoteCode        VARCHAR(30)     NOT NULL UNIQUE,
    NoteType        VARCHAR(10)     NOT NULL,   -- 'CREDIT','DEBIT'
    InvoiceID       INT             NOT NULL REFERENCES Invoices(InvoiceID),
    CustomerID      INT             NOT NULL REFERENCES Customers(CustomerID),
    Amount          DECIMAL(18,2)   NOT NULL,
    Reason          NVARCHAR(500),
    Status          VARCHAR(20)     DEFAULT 'PENDING', -- 'PENDING','APPROVED','REJECTED'
    ApprovedBy      INT             REFERENCES Users(UserID),
    ApprovedAt      DATETIME2,
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Đối soát ngân hàng (UC044)
CREATE TABLE BankReconciliations (
    ReconcileID     INT PRIMARY KEY IDENTITY(1,1),
    BankTxnRef      VARCHAR(100)    NOT NULL UNIQUE,
    BankTxnDate     DATE            NOT NULL,
    Amount          DECIMAL(18,2)   NOT NULL,
    Description     NVARCHAR(500),
    MatchedInvoiceID INT            REFERENCES Invoices(InvoiceID),
    MatchedPaymentID INT            REFERENCES Payments(PaymentID),
    Status          VARCHAR(20)     DEFAULT 'UNMATCHED', -- 'UNMATCHED','MATCHED','PARTIAL'
    ImportedAt      DATETIME2       DEFAULT GETDATE()
);
 
-- Cấu hình kỳ hạn nợ (UC045)
CREATE TABLE DebtTermConfigs (
    TermID          INT PRIMARY KEY IDENTITY(1,1),
    CustomerTier    VARCHAR(10)     NOT NULL,  -- 'BRONZE','SILVER','GOLD'
    PaymentDays     INT             NOT NULL,  -- Số ngày nợ tối đa
    ReminderDay1    INT             DEFAULT 3,  -- Nhắc trước N ngày
    ReminderDay2    INT             DEFAULT 1,
    IsActive        BIT             DEFAULT 1
);
 
-- Phê duyệt chi phí ngoại lệ (UC047)
CREATE TABLE ExceptionExpenses (
    ExpenseID       INT PRIMARY KEY IDENTITY(1,1),
    ExpenseCode     VARCHAR(30)     NOT NULL UNIQUE,
    Description     NVARCHAR(500)   NOT NULL,
    Amount          DECIMAL(18,2)   NOT NULL,
    ExpenseDate     DATE,
    Status          VARCHAR(20)     DEFAULT 'PENDING',
    ApprovedBy      INT             REFERENCES Users(UserID),
    ApprovedAt      DATETIME2,
    RequestedBy     INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- ============================================================
-- MODULE 5: BI & HỆ THỐNG (UC051, UC053, UC055)
-- ============================================================
 
-- Quản lý FAQ (UC051)
CREATE TABLE FAQItems (
    FAQID           INT PRIMARY KEY IDENTITY(1,1),
    Category        NVARCHAR(100),
    Question        NVARCHAR(500)   NOT NULL,
    Answer          NVARCHAR(2000)  NOT NULL,
    Tags            NVARCHAR(300),
    IsActive        BIT             DEFAULT 1,
    CreatedBy       INT             REFERENCES Users(UserID),
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Cấu hình tham số AI (UC053)
CREATE TABLE AIParameters (
    ParamID         INT PRIMARY KEY IDENTITY(1,1),
    ParamKey        VARCHAR(100)    NOT NULL UNIQUE,
    ParamValue      NVARCHAR(500)   NOT NULL,
    Description     NVARCHAR(500),
    UpdatedBy       INT             REFERENCES Users(UserID),
    UpdatedAt       DATETIME2       DEFAULT GETDATE()
);
 
-- Giám sát tích hợp API (UC055)
CREATE TABLE APIIntegrationLogs (
    LogID           BIGINT PRIMARY KEY IDENTITY(1,1),
    APIName         VARCHAR(100)    NOT NULL,  -- 'GOOGLE_MAPS','BANK_WEBHOOK','SMS_GATEWAY'
    Endpoint        VARCHAR(500),
    Method          VARCHAR(10),
    StatusCode      INT,
    DurationMs      INT,
    IsSuccess       BIT,
    ErrorMessage    NVARCHAR(1000),
    LoggedAt        DATETIME2       DEFAULT GETDATE()
);
 
-- Thông báo tự động (UC035)
CREATE TABLE NotificationConfigs (
    ConfigID        INT PRIMARY KEY IDENTITY(1,1),
    EventType       VARCHAR(100)    NOT NULL,
    Channel         VARCHAR(30)     NOT NULL,  -- 'EMAIL','SMS','ZALO'
    Template        NVARCHAR(2000)  NOT NULL,
    IsActive        BIT             DEFAULT 1,
    CreatedAt       DATETIME2       DEFAULT GETDATE()
);
 

CREATE TABLE Waybills (
    WaybillId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId INT FOREIGN KEY REFERENCES ServiceOrders(OrderId) ON DELETE CASCADE,
    WaybillCode VARCHAR(50) NOT NULL UNIQUE,
    QrCodeBase64 NVARCHAR(MAX) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- ============================================================
-- INDEXES để tối ưu hiệu năng
-- ============================================================
 
CREATE INDEX IX_Inventory_SKU     ON Inventory (SKUID);
CREATE INDEX IX_Inventory_Bin     ON Inventory (BinID);
CREATE INDEX IX_StockLedger_SKU   ON StockLedger (SKUID, CreatedAt DESC);
CREATE INDEX IX_SlotBooking_Date  ON SlotBookings (ScheduledDate, WarehouseID);
CREATE INDEX IX_GateLog_Vehicle   ON GateLogs (VehicleID, EventAt DESC);
CREATE INDEX IX_VehicleEvents_Vehicle ON VehicleEvents (VehicleID, EventTime DESC);
CREATE INDEX IX_Invoice_Status    ON Invoices (Status, DueDate);
CREATE INDEX IX_ServiceOrder_Cust ON ServiceOrders (CustomerID, CreatedAt DESC);
CREATE INDEX IX_Customer_Tier     ON Customers (Tier);
CREATE INDEX IX_Vehicles_Plate    ON Vehicles (TruckPlate);
CREATE INDEX IX_AuditLog_User     ON AuditLog (UserID, LoggedAt DESC);
 
-- ============================================================
-- DỮ LIỆU MẪU
-- ============================================================
 
-- 1. Company Profile
INSERT INTO CompanyProfile (CompanyName, TaxCode, Address, Phone, Email, Website)
VALUES (N'Công ty TNHH SmartLog Việt Nam', '0312345678',
        N'18 Cộng Hòa, Phường 4, Tân Bình, TP.HCM', '028 3812 5678',
        'info@smartlog.vn', 'https://smartlog.vn');
 
-- 2. Master Categories
INSERT INTO MasterCategory (CategoryType, Code, NameVN, NameEN) VALUES
('CURRENCY', 'VND', N'Việt Nam Đồng', 'Vietnamese Dong'),
('CURRENCY', 'USD', N'Đô la Mỹ', 'US Dollar'),
('UNIT', 'CBM', N'Mét khối', 'Cubic Meter'),
('UNIT', 'TON', N'Tấn', 'Metric Ton'),
('UNIT', 'PALLET', N'Pallet', 'Pallet'),
('UNIT', 'PIECE', N'Kiện', 'Piece'),
('ZONE_TYPE', 'NORMAL', N'Hàng thường', 'Normal Goods'),
('ZONE_TYPE', 'COLD', N'Hàng lạnh', 'Cold Storage'),
('ZONE_TYPE', 'HAZMAT', N'Hàng nguy hiểm', 'Hazardous Materials'),
('ZONE_TYPE', 'HEAVY', N'Hàng nặng', 'Heavy Goods'),
('CARGO_TYPE', 'CONSUMER', N'Hàng tiêu dùng', 'Consumer Goods'),
('CARGO_TYPE', 'ELECTRONIC', N'Điện tử', 'Electronics'),
('CARGO_TYPE', 'FOOD', N'Thực phẩm', 'Food & Beverage'),
('CARGO_TYPE', 'PHARMA', N'Dược phẩm', 'Pharmaceuticals');
 
-- 3. SLA Configs
INSERT INTO SLAConfig (PartnerTier, MaxWaitHours, MaxDockhours, CompensationPct, Description) VALUES
('STANDARD',    4, 2, 0.00, N'Gói tiêu chuẩn'),
('PREMIUM',     2, 1, 5.00, N'Gói cao cấp – bồi thường 5% nếu vi phạm'),
('ENTERPRISE',  1, 1, 10.00, N'Gói doanh nghiệp – bồi thường 10% nếu vi phạm');
 
-- 4. Roles
INSERT INTO Roles (RoleCode, RoleName, Description) VALUES
('ADMIN',       N'Quản trị hệ thống',   N'Toàn quyền cấu hình và giám sát'),
('WF',          N'Kho & Tài chính',      N'Nhân viên kho và kế toán'),
('DISPATCHER',  N'Điều phối viên',       N'Điều hành xe và cổng kho'),
('CUSTOMER',    N'Khách hàng',           N'Chủ hàng, doanh nghiệp gửi hàng');
 
-- 5. Users
INSERT INTO Users (Username, PasswordHash, FullName, Email, Phone, RoleID) VALUES
('admin.system',    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    N'Nguyễn Quản Trị', 'admin@smartlog.vn', '0901111001', 1),
('le.duy',          '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    N'Lê Duy', 'le.duy@smartlog.vn', '0901111002', 2),
('tung.van',        '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    N'Trần Văn Tùng', 'tung.van@smartlog.vn', '0901111003', 2),
('huy.gia',         '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    N'Đặng Gia Huy', 'huy.gia@smartlog.vn', '0901111004', 3),
('hung.quoc',       '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    N'Lý Quốc Hùng', 'hung.quoc@smartlog.vn', '0901111005', 3),
('quan.hai',        '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    N'Phạm Hải Quân', 'quan.hai@smartlog.vn', '0901111006', 2),
('cust.abcfood',    '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    N'ABC Food Corp', 'logistics@abcfood.vn', '0281234567', 4),
('cust.techzone',   '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    N'TechZone Vietnam', 'ops@techzone.vn', '0289876543', 4),
('cust.pharmaviet', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    N'PharmaViet JSC', 'supply@pharmaviet.vn', '0282468135', 4),
('cust.freshmart',  '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    N'FreshMart Retail', 'wh@freshmart.vn', '0287654321', 4);
 
-- 6. Customers
INSERT INTO Customers (CustomerCode, CompanyName, ContactName, Email, Phone, Address, TaxCode,
                        Tier, TotalOrders12M, SLAID, UserID) VALUES
('CUST001', N'ABC Food Corporation', N'Nguyễn Thị Mai',
    'logistics@abcfood.vn', '028 1234 5670', N'45 Phan Đình Phùng, Phú Nhuận, TP.HCM',
    '0302111111', 'GOLD', 150, 3, 7),
('CUST002', N'TechZone Vietnam Co. Ltd', N'Trần Minh Khoa',
    'ops@techzone.vn', '028 9876 5430', N'90 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM',
    '0302222222', 'SILVER', 55, 2, 8),
('CUST003', N'PharmaViet Joint Stock Company', N'Lê Thị Hồng',
    'supply@pharmaviet.vn', '028 2468 1350', N'120 Pasteur, Q.1, TP.HCM',
    '0302333333', 'GOLD', 200, 3, 9),
('CUST004', N'FreshMart Retail Chain', N'Phạm Đức Thành',
    'wh@freshmart.vn', '028 7654 3210', N'55 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM',
    '0302444444', 'BRONZE', 12, 1, 10);
 
-- 7. Vouchers
INSERT INTO Vouchers (VoucherCode, CustomerTier, CustomerID, DiscountPct, MinOrderValue, ValidFrom, ValidTo) VALUES
('GOLD2025Q2',   'GOLD',   NULL, 10.00, 5000000,  '2025-04-01', '2025-06-30'),
('SILVER2025Q2', 'SILVER', NULL,  5.00, 2000000,  '2025-04-01', '2025-06-30'),
('VIP_ABC001',   NULL,     1,    12.00, 10000000, '2025-05-01', '2025-12-31'),
('WELCOME004',   NULL,     4,     3.00,  500000,  '2025-05-01', '2025-07-31');
 
-- 8. Price Config
INSERT INTO PriceConfig (ServiceType, Zone, BasePrice, Unit, SurchargeType, SurchargeValue, EffectiveFrom) VALUES
(N'Lưu kho thường',     N'TP.HCM',      15000,  'CBM',   NULL, 0, '2025-01-01'),
(N'Lưu kho lạnh',       N'TP.HCM',      45000,  'CBM',   NULL, 0, '2025-01-01'),
(N'Bốc dỡ nội địa',     N'TP.HCM',     120000,  'TON',   NULL, 0, '2025-01-01'),
(N'Vận chuyển nội thành',N'TP.HCM',    250000,  'TRIP',  N'Hàng nguy hiểm', 20000, '2025-01-01'),
(N'Vận chuyển liên tỉnh',N'HCM-HN',   1800000, 'TRIP',  N'Hàng cồng kềnh', 50000, '2025-01-01'),
(N'Cắm điện hàng lạnh', N'TP.HCM',      80000,  'TRIP',  NULL, 0, '2025-01-01'),
(N'Phí giao đêm',       NULL,           150000,  'TRIP',  NULL, 0, '2025-01-01');
 
-- 9. Debt Term Configs
INSERT INTO DebtTermConfigs (CustomerTier, PaymentDays, ReminderDay1, ReminderDay2) VALUES
('BRONZE', 7,  3, 1),
('SILVER', 15, 5, 2),
('GOLD',   30, 7, 3);
 
-- 10. Warehouse
INSERT INTO Warehouses (WarehouseCode, WarehouseName, Address, TotalCapacity) VALUES
('WH001', N'Kho Tân Bình',         N'18 Cộng Hòa, Tân Bình, TP.HCM',    5000.00),
('WH002', N'Kho Bình Dương',       N'KCN Sóng Thần 2, Dĩ An, Bình Dương', 8000.00),
('WH003', N'Kho lạnh Long An',     N'KCN Đức Hòa 1, Long An',             3000.00);
 
-- 11. Zones
INSERT INTO WarehouseZones (WarehouseID, ZoneCode, ZoneName, ZoneType, Capacity) VALUES
(1, 'WH001-A', N'Khu A - Hàng thường',  'NORMAL', 2000),
(1, 'WH001-B', N'Khu B - Hàng nặng',   'HEAVY',  1500),
(1, 'WH001-C', N'Khu C - Hàng lạnh',   'COLD',    800),
(1, 'WH001-D', N'Khu D - Hàng nguy hiểm', 'HAZMAT', 200),
(2, 'WH002-A', N'Khu A - Hàng tiêu dùng','NORMAL', 4000),
(2, 'WH002-B', N'Khu B - Điện tử',     'NORMAL', 2000),
(3, 'WH003-A', N'Khu lạnh dược phẩm',  'COLD',   1500),
(3, 'WH003-B', N'Khu lạnh thực phẩm',  'COLD',   1500);
 
-- 12. Shelves
INSERT INTO WarehouseShelves (ZoneID, ShelfCode, FloorLevel, MaxWeightKg) VALUES
(1, 'A-R01-L1', 1, 5000), (1, 'A-R01-L2', 2, 3000), (1, 'A-R02-L1', 1, 5000),
(2, 'B-R01-L1', 1, 15000),(2, 'B-R02-L1', 1, 15000),
(3, 'C-R01-L1', 1, 3000), (3, 'C-R01-L2', 2, 2000),
(5, 'A2-R01-L1',1, 5000), (5, 'A2-R01-L2',2, 3000),
(7, 'P-R01-L1', 1, 2000), (7, 'P-R01-L2', 2, 2000);
 
-- 13. Bins
INSERT INTO WarehouseBins (ShelfID, BinCode, BinType, CapacityCBM, MaxWeightKg) VALUES
(1, 'WH001-A-R01-L1-B01', 'STANDARD', 10.0, 2000),
(1, 'WH001-A-R01-L1-B02', 'STANDARD', 10.0, 2000),
(2, 'WH001-A-R01-L2-B01', 'STANDARD',  8.0, 1500),
(4, 'WH001-B-R01-L1-B01', 'STANDARD', 20.0, 8000),
(4, 'WH001-B-R01-L1-B02', 'STANDARD', 20.0, 8000),
(6, 'WH001-C-R01-L1-B01', 'COLD',      5.0, 1000),
(6, 'WH001-C-R01-L1-B02', 'COLD',      5.0, 1000),
(7, 'WH001-C-R01-L2-B01', 'COLD',      4.0,  800),
(8, 'WH002-A-R01-L1-B01', 'STANDARD', 15.0, 3000),
(8, 'WH002-A-R01-L1-B02', 'STANDARD', 15.0, 3000),
(10,'WH003-P-R01-L1-B01', 'COLD',      5.0, 1200),
(10,'WH003-P-R01-L1-B02', 'COLD',      5.0, 1200),
(11,'WH003-P-R01-L2-B01', 'COLD',      4.0,  800);
 
-- 14. Docks
INSERT INTO Docks (WarehouseID, DockCode, DockName, Status, MaxTruckLength) VALUES
(1, 'WH001-D01', N'Cửa 01 – Nhập',   'AVAILABLE', 16.5),
(1, 'WH001-D02', N'Cửa 02 – Nhập',   'AVAILABLE', 16.5),
(1, 'WH001-D03', N'Cửa 03 – Xuất',   'AVAILABLE', 16.5),
(1, 'WH001-D04', N'Cửa 04 – Xuất',   'MAINTENANCE', 16.5),
(2, 'WH002-D01', N'Cửa 01 – Đa năng','AVAILABLE', 20.0),
(2, 'WH002-D02', N'Cửa 02 – Đa năng','OCCUPIED',  20.0),
(3, 'WH003-D01', N'Cửa lạnh 01',     'AVAILABLE', 13.6);
 
-- 15. Product Categories
INSERT INTO ProductCategories (ParentID, CategoryCode, CategoryName) VALUES
(NULL, 'ROOT-FOOD',  N'Thực phẩm & Đồ uống'),
(NULL, 'ROOT-ELEC',  N'Điện tử & Công nghệ'),
(NULL, 'ROOT-PHARM', N'Dược phẩm & Y tế'),
(NULL, 'ROOT-CONS',  N'Hàng tiêu dùng'),
(1, 'FOOD-FROZEN',   N'Thực phẩm đông lạnh'),
(1, 'FOOD-BEVERAGE', N'Nước giải khát'),
(2, 'ELEC-PHONE',    N'Điện thoại & Phụ kiện'),
(2, 'ELEC-LAPTOP',   N'Máy tính xách tay'),
(3, 'PHARM-OTC',     N'Thuốc không kê đơn'),
(3, 'PHARM-INJECT',  N'Sinh phẩm tiêm chích');
 
-- 16. SKUs
INSERT INTO SKUs (SKUCode, Barcode, ProductName, CategoryID, CustomerID,
                  WeightKg, LengthCm, WidthCm, HeightCm,
                  StorageTemp, IsFragile, IsHeavy, SafetyMinQty, ExpiryDays) VALUES
('SKU-ABC001', '8938501234001', N'Nước ép cam ABC 1L (Thùng 12 chai)', 6, 1,
    12.0, 40, 30, 25, 'COLD', 0, 0, 50, 180),
('SKU-ABC002', '8938501234002', N'Sữa tươi ABC 500ml (Thùng 24 hộp)', 6, 1,
    12.5, 40, 35, 30, 'COLD', 0, 0, 100, 60),
('SKU-TECH001', '4896012340001', N'iPhone 15 Pro 256GB (Hộp)', 7, 2,
    0.4, 16, 8, 8, 'AMBIENT', 1, 0, 20, NULL),
('SKU-TECH002', '4896012340002', N'MacBook Pro M3 14 inch', 8, 2,
    1.55, 32, 22, 2, 'AMBIENT', 1, 0, 10, NULL),
('SKU-PV001',   '8938509876001', N'Paracetamol 500mg (Hộp 100 viên)', 9, 3,
    0.15, 12, 8, 4, 'AMBIENT', 0, 0, 200, 730),
('SKU-PV002',   '8938509876002', N'Vaccine BCG 10 dose vial', 10, 3,
    0.08, 5, 5, 8, 'COLD', 1, 0, 50, 365),
('SKU-FM001',   '8938507654001', N'Tôm sú đông lạnh 1kg', 5, 4,
    1.0, 25, 15, 8, 'COLD', 0, 0, 30, 365),
('SKU-FM002',   '8938507654002', N'Thịt bò Úc đông lạnh 500g', 5, 4,
    0.5, 20, 15, 5, 'COLD', 0, 0, 20, 540);
 
-- 17. Inventory (Tồn kho ban đầu)
INSERT INTO Inventory (SKUID, BinID, Quantity, BatchNo, ExpiryDate, InboundDate) VALUES
(1, 6, 120, 'BATCH-ABC-250101', '2025-07-01', '2025-01-10'),
(2, 7, 200, 'BATCH-ABC-250102', '2025-04-01', '2025-01-10'),
(3, 1,  45, 'BATCH-TZ-250201',  NULL,         '2025-02-15'),
(4, 1,  18, 'BATCH-TZ-250202',  NULL,         '2025-02-15'),
(5, 2, 500, 'BATCH-PV-250301',  '2026-03-01', '2025-03-01'),
(6,11,  80, 'BATCH-PV-250302',  '2025-12-31', '2025-03-01'),
(7,12,  60, 'BATCH-FM-250401',  '2026-04-01', '2025-04-01'),
(8,12,  35, 'BATCH-FM-250402',  '2026-10-01', '2025-04-01');
 
-- 18. Stock Ledger mẫu
INSERT INTO StockLedger (SKUID, BinID, TxnType, Qty, QtyBefore, QtyAfter, RefType, RefID, CreatedBy) VALUES
(1, 6, 'INBOUND', 120,   0, 120, 'INBOUND_ORDER', 1, 2),
(2, 7, 'INBOUND', 200,   0, 200, 'INBOUND_ORDER', 1, 2),
(3, 1, 'INBOUND',  45,   0,  45, 'INBOUND_ORDER', 2, 3),
(4, 1, 'INBOUND',  18,   0,  18, 'INBOUND_ORDER', 2, 3),
(5, 2, 'INBOUND', 500,   0, 500, 'INBOUND_ORDER', 3, 2),
(6,11, 'INBOUND',  80,   0,  80, 'INBOUND_ORDER', 4, 6),
(7,12, 'INBOUND',  60,   0,  60, 'INBOUND_ORDER', 5, 3),
(8,12, 'INBOUND',  35,   0,  35, 'INBOUND_ORDER', 5, 3);
 
-- 19. Drivers
INSERT INTO Drivers (DriverCode, FullName, Phone, LicenseNo, LicenseExpiry) VALUES
('DRV001', N'Nguyễn Văn An',   '0912345601', 'B2-000111', '2027-06-30'),
('DRV002', N'Trần Thành Công', '0912345602', 'C-000222',  '2026-12-31'),
('DRV003', N'Lê Minh Tuấn',   '0912345603', 'C-000333',  '2028-03-31'),
('DRV004', N'Phạm Văn Bình',  '0912345604', 'C-000444',  '2025-09-30'),
('DRV005', N'Hoàng Đức Nam',  '0912345605', 'D-000555',  '2026-08-31');
 
-- 20. Vehicles
INSERT INTO Vehicles (TruckPlate, TrailerPlate, VehicleType, MaxWeightTon,
                       OwnerName, IsInternal, DefaultDriverID,
                       InspectionExpiry, NextServiceDate, GPSDeviceID) VALUES
('51C-12345', '51R-11111', 'CONTAINER_40', 30.0, N'SmartLog Internal', 1, 1, '2026-03-31', '2025-09-01', 'GPS-A001'),
('51C-23456', '51R-22222', 'CONTAINER_20', 20.0, N'SmartLog Internal', 1, 2, '2026-06-30', '2025-08-01', 'GPS-A002'),
('61C-54321', NULL,         'TRUCK',       15.0, N'Vận tải Hoàng Long', 0, 3, '2025-12-31', '2025-10-01', NULL),
('79C-98765', '79R-44444', 'CONTAINER_40', 32.0, N'Vận tải Tiến Phát', 0, 4, '2026-01-31', '2025-11-01', NULL),
('50C-11111', NULL,         'VAN',          3.5, N'Giao hàng nhanh Sài Gòn', 0, 5, '2026-09-30', '2025-12-01', 'GPS-B001');
 
-- 21. Slot Bookings
INSERT INTO SlotBookings (BookingCode, QRCode, VehicleID, DriverID, CustomerID,
                           WarehouseID, DockID, BookingType,
                           ScheduledDate, ScheduledStart, ScheduledEnd, Status,
                           CheckInAt, ALPR_Plate, ALPRConfidence, PriorityScore, CreatedBy) VALUES
('BK-20250510-001', 'QR-BK001', 1, 1, 1, 1, 1, 'INBOUND',
    '2025-05-10', '08:00', '10:00', 'COMPLETED',
    '2025-05-10 08:05:22', '51C-12345', 98.5, 60, 5),
('BK-20250510-002', 'QR-BK002', 3, 3, 2, 1, 2, 'INBOUND',
    '2025-05-10', '09:00', '11:00', 'COMPLETED',
    '2025-05-10 09:12:44', '61C-54321', 96.2, 40, 4),
('BK-20250511-001', 'QR-BK003', 2, 2, 3, 3, 7, 'INBOUND',
    '2025-05-11', '07:30', '09:30', 'COMPLETED',
    '2025-05-11 07:28:10', '51C-23456', 99.1, 80, 5),
('BK-20250520-001', 'QR-BK004', 4, 4, 1, 1, 3, 'OUTBOUND',
    '2025-05-20', '14:00', '16:00', 'COMPLETED',
    '2025-05-20 14:03:55', '79C-98765', 97.8, 60, 4),
('BK-20250601-001', 'QR-BK005', 5, 5, 4, 1, 1, 'INBOUND',
    '2025-06-01', '10:00', '12:00', 'CONFIRMED',
    NULL, NULL, NULL, 30, 5);
 
-- 22. Gate Logs
INSERT INTO GateLogs (BookingID, VehicleID, DriverID, EventType, EventAt,
                       ALPR_Plate, ALPRConfidence, OperatorID) VALUES
(1, 1, 1, 'CHECKIN',  '2025-05-10 08:05:22', '51C-12345', 98.5, 4),
(1, 1, 1, 'CHECKOUT', '2025-05-10 10:18:44', '51C-12345', 97.9, 4),
(2, 3, 3, 'CHECKIN',  '2025-05-10 09:12:44', '61C-54321', 96.2, 5),
(2, 3, 3, 'CHECKOUT', '2025-05-10 11:05:30', '61C-54321', 95.8, 5),
(3, 2, 2, 'CHECKIN',  '2025-05-11 07:28:10', '51C-23456', 99.1, 4),
(3, 2, 2, 'CHECKOUT', '2025-05-11 09:45:22', '51C-23456', 98.7, 4),
(4, 4, 4, 'CHECKIN',  '2025-05-20 14:03:55', '79C-98765', 97.8, 5),
(4, 4, 4, 'CHECKOUT', '2025-05-20 16:22:10', '79C-98765', 97.5, 5);
 
-- 23. Inbound Orders
INSERT INTO InboundOrders (InboundCode, CustomerID, WarehouseID, ExpectedDate, ActualDate,
                            Status, OCRConfidence, RequireManual, CreatedBy) VALUES
('IB-20250510-001', 1, 1, '2025-05-10', '2025-05-10', 'COMPLETED', 92.5, 0, 2),
('IB-20250510-002', 2, 1, '2025-05-10', '2025-05-10', 'COMPLETED', 78.0, 1, 3),
('IB-20250511-001', 3, 3, '2025-05-11', '2025-05-11', 'COMPLETED', 95.1, 0, 2),
('IB-20250515-001', 4, 3, '2025-05-15', '2025-05-15', 'COMPLETED', 88.3, 0, 3),
('IB-20250601-001', 1, 1, '2025-06-01', NULL,         'PENDING',   NULL,  0, 2);
 
-- 24. Inbound Order Lines
INSERT INTO InboundOrderLines (InboundID, SKUID, ExpectedQty, ReceivedQty, BinID,
                                AISlottedBinID, BatchNo, ExpiryDate, ConditionStatus) VALUES
(1, 1, 120, 120, 6, 6, 'BATCH-ABC-250101', '2025-07-01', 'GOOD'),
(1, 2, 200, 200, 7, 7, 'BATCH-ABC-250102', '2025-04-01', 'GOOD'),
(2, 3,  50,  45, 1, 1, 'BATCH-TZ-250201',  NULL,         'DAMAGED'),
(2, 4,  20,  18, 1, 1, 'BATCH-TZ-250202',  NULL,         'GOOD'),
(3, 5, 500, 500, 2, 2, 'BATCH-PV-250301',  '2026-03-01', 'GOOD'),
(3, 6,  80,  80,11,11, 'BATCH-PV-250302',  '2025-12-31', 'GOOD'),
(4, 7,  60,  60,12,12, 'BATCH-FM-250401',  '2026-04-01', 'GOOD'),
(4, 8,  35,  35,12,12, 'BATCH-FM-250402',  '2026-10-01', 'GOOD');
 
-- 25. Cargo Photos
INSERT INTO CargoPhotos (LineID, PhotoURL, PhotoAngle, IsDamaged, TakenBy) VALUES
(3, '/photos/IB-250510-002-L3-front.jpg',  'FRONT',  1, 3),
(3, '/photos/IB-250510-002-L3-side.jpg',   'SIDE',   1, 3),
(3, '/photos/IB-250510-002-L3-detail.jpg', 'DETAIL', 1, 3),
(1, '/photos/IB-250510-001-L1-front.jpg',  'FRONT',  0, 2);
 
-- 26. Service Orders
INSERT INTO ServiceOrders (OrderCode, CustomerID, WarehouseID, ServiceType,
                            PickupAddress, DeliveryAddress,
                            TotalWeightKg, TotalCBM, TotalPallets,
                            EstimatedCost, VoucherID, DiscountAmount, FinalCost,
                            Status, Priority, PriorityScore, SLAID, CreatedBy,
                            ConfirmedAt, DeliveredAt) VALUES
('ORD-20250515-001', 1, 1, 'EXPORT',
    N'Kho Tân Bình – 18 Cộng Hòa', N'45 Phan Đình Phùng, Phú Nhuận',
    240.0, 6.0, 2, 3200000, 3, 384000, 2816000,
    'DELIVERED', 'NORMAL', 60, 3, 7,
    '2025-05-15 09:00:00', '2025-05-15 15:30:00'),
('ORD-20250516-001', 2, 1, 'TRANSPORT',
    N'90 Nguyễn Văn Trỗi, Phú Nhuận', N'KCN Sóng Thần 2, Bình Dương',
    55.0, 2.5, 1, 1750000, 2, 87500, 1662500,
    'DELIVERED', 'NORMAL', 40, 2, 8,
    '2025-05-16 08:30:00', '2025-05-16 14:00:00'),
('ORD-20250518-001', 3, 3, 'IMPORT',
    N'Cảng Cát Lái, Q.2', N'Kho lạnh Long An',
    80.0, 1.2, 1, 980000, 3, 117600, 862400,
    'IN_STORAGE', 'URGENT', 80, 3, 9,
    '2025-05-18 07:00:00', NULL),
('ORD-20250520-001', 4, 3, 'STORAGE',
    N'55 Đinh Tiên Hoàng', N'55 Đinh Tiên Hoàng',
    35.0, 0.8, 1, 420000, 4, 12600, 407400,
    'IN_STORAGE', 'NORMAL', 30, 1, 10,
    '2025-05-20 10:00:00', NULL),
('ORD-20250601-001', 1, 1, 'EXPORT',
    N'Kho Tân Bình', N'Cảng Cát Lái',
    480.0, 12.0, 4, 5800000, 3, 696000, 5104000,
    'CONFIRMED', 'PERISHABLE', 110, 3, 7,
    '2025-06-01 08:00:00', NULL);
 
-- 27. Order Lines
INSERT INTO OrderLines (OrderID, SKUID, ProductDesc, Quantity, WeightKg, VolumeCBM, UnitPrice, LineTotal) VALUES
(1, 1, N'Nước ép cam ABC 1L', 10, 120.0, 3.0, 180000, 1800000),
(1, 2, N'Sữa tươi ABC 500ml', 10, 125.0, 3.0, 140000, 1400000),
(2, 3, N'iPhone 15 Pro', 5, 2.0, 0.5, 250000, 1250000),
(2, 4, N'MacBook Pro M3', 3, 4.65, 0.4, 166667, 500000),
(3, 5, N'Paracetamol 500mg', 100, 15.0, 0.6, 9800, 980000),
(4, 7, N'Tôm sú đông lạnh', 20, 20.0, 0.4, 21000, 420000),
(5, 1, N'Nước ép cam ABC', 20, 240.0, 6.0, 180000, 3600000),
(5, 2, N'Sữa tươi ABC',    18, 225.0, 5.4, 122222, 2200000);
 
-- 28. Outbound Orders
INSERT INTO OutboundOrders (OutboundCode, OrderID, WarehouseID, Status, LabelPrinted, CreatedBy, CompletedAt) VALUES
('OB-20250515-001', 1, 1, 'DISPATCHED', 1, 2, '2025-05-15 11:30:00'),
('OB-20250516-001', 2, 1, 'DISPATCHED', 1, 3, '2025-05-16 10:00:00');
 
-- 29. Outbound Lines
INSERT INTO OutboundLines (OutboundID, SKUID, BinID, RequiredQty, PickedQty, QRLabel) VALUES
(1, 1, 6, 10, 10, 'QR-OB001-SKU001'),
(1, 2, 7, 10, 10, 'QR-OB001-SKU002'),
(2, 3, 1,  5,  5, 'QR-OB002-SKU003'),
(2, 4, 1,  3,  3, 'QR-OB002-SKU004');
 
-- 30. Stocktake
INSERT INTO StocktakeOrders (StocktakeCode, WarehouseID, StocktakeDate, Status, CreatedBy, CompletedAt) VALUES
('ST-20250531-001', 1, '2025-05-31', 'COMPLETED', 1, '2025-05-31 17:00:00'),
('ST-20250531-002', 3, '2025-05-31', 'COMPLETED', 1, '2025-05-31 16:30:00');
 
INSERT INTO StocktakeLines (StocktakeID, SKUID, BinID, SystemQty, CountedQty, RequireRecount, Note) VALUES
(1, 1, 6, 110, 110, 0, NULL),
(1, 2, 7, 190, 185, 0, N'Thiếu 5 hộp do xuất chưa cập nhật'),
(1, 3, 1,  40,  40, 0, NULL),
(1, 4, 1,  15,  13, 0, N'Chênh lệch 2 hộp – cần kiểm tra'),
(2, 5, 2, 400, 398, 0, NULL),
(2, 6,11,  80,  80, 0, NULL),
(2, 7,12,  40,  41, 0, N'Kiểm lại - dư 1 kiện chưa rõ nguồn');
 
-- 31. Stock Alerts
INSERT INTO StockAlerts (SKUID, AlertType, CurrentQty, ThresholdQty, EmailSentAt, IsResolved) VALUES
(2, 'EXPIRY_SOON',   185, NULL,   '2025-03-15 09:00:00', 0),
(7, 'LOW_STOCK',      40,  30,    '2025-05-28 08:00:00', 0),
(3, 'LOW_STOCK',      40,  20,    NULL,                   0);
 
-- 32. Invoices
INSERT INTO Invoices (InvoiceNo, OrderID, CustomerID, IssueDate, DueDate,
                       SubTotal, DiscountAmt, VATRate, PaidAmount, Status, PDFPath, CreatedBy) VALUES
('INV-2025-0001', 1, 1, '2025-05-15', '2025-06-14', 3200000, 384000, 10.00, 3059200, 'PAID',
    '/invoices/INV-2025-0001.pdf', 2),
('INV-2025-0002', 2, 2, '2025-05-16', '2025-05-31', 1750000,  87500, 10.00, 1832500, 'PAID',
    '/invoices/INV-2025-0002.pdf', 3),
('INV-2025-0003', 3, 3, '2025-05-18', '2025-06-17',  980000, 117600, 10.00,       0, 'PENDING',
    '/invoices/INV-2025-0003.pdf', 2),
('INV-2025-0004', 4, 4, '2025-05-20', '2025-05-27',  420000,  12600, 10.00,       0, 'OVERDUE',
    '/invoices/INV-2025-0004.pdf', 3),
('INV-2025-0005', 5, 1, '2025-06-01', '2025-07-01', 5800000, 696000, 10.00,       0, 'PENDING',
    NULL, 2);
 
-- 33. Service Charges
INSERT INTO ServiceCharges (ChargeCode, OrderID, InvoiceID, ChargeType, Description, Amount, IsApproved, CreatedBy) VALUES
('CHG-20250515-001', 1, 1, N'Lưu kho',   N'Phí lưu kho 6 CBM x 5 ngày',     450000, 1, 2),
('CHG-20250515-002', 1, 1, N'Bốc dỡ',   N'Phí bốc dỡ 240kg',               120000, 1, 2),
('CHG-20250515-003', 1, 1, N'Vận chuyển',N'Phí vận chuyển nội thành',        250000, 1, 2),
('CHG-20250516-001', 2, 2, N'Vận chuyển',N'HCM – Bình Dương 55kg',          350000, 1, 3),
('CHG-20250518-001', 3, 3, N'Lưu kho lạnh',N'1.2 CBM x 7 ngày x 45000',    378000, 1, 2),
('CHG-20250518-002', 3, 3, N'Cắm điện',  N'Dược phẩm yêu cầu UPS',          80000, 1, 2);
 
-- 34. Payments
INSERT INTO Payments (PaymentCode, InvoiceID, CustomerID, Amount, PaymentMethod,
                       BankTxnRef, HashCode, ReceiptPath, PaidAt, ConfirmedBy) VALUES
('PAY-20250515-001', 1, 1, 3059200, 'BANK_TRANSFER',
    'BIDV-TXN-20250515-881234',
    'a3f1b2c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
    '/receipts/PAY-20250515-001.pdf', '2025-05-15 16:45:00', 2),
('PAY-20250516-001', 2, 2, 1832500, 'BANK_TRANSFER',
    'VCB-TXN-20250517-443210',
    'b4c5d6e7f8901234abcdef5678901234abcdef5678901234abcdef5678901234',
    '/receipts/PAY-20250516-001.pdf', '2025-05-17 09:10:00', 3);
 
-- 35. Bank Reconciliation
INSERT INTO BankReconciliations (BankTxnRef, BankTxnDate, Amount, Description,
                                  MatchedInvoiceID, MatchedPaymentID, Status) VALUES
('BIDV-TXN-20250515-881234', '2025-05-15', 3059200, N'CK TT HD INV-2025-0001 ABC FOOD',
    1, 1, 'MATCHED'),
('VCB-TXN-20250517-443210',  '2025-05-17', 1832500, N'THANH TOAN HD INV-2025-0002 TECHZONE',
    2, 2, 'MATCHED'),
('ACB-TXN-20250520-001122',  '2025-05-20',  500000, N'CK chua ro nguon',
    NULL, NULL, 'UNMATCHED');
 
-- 36. Complaints
INSERT INTO Complaints (ComplaintCode, CustomerID, OrderID, ComplaintType, Description,
                         Status, AssignedTo, DeadlineAt) VALUES
('CMP-20250511-001', 2, 2, 'DAMAGED',
    N'5 hộp iPhone bị móp vỏ hộp, nghi do bốc xếp sai tư thế.',
    'IN_PROGRESS', 6, '2025-05-18 09:12:44'),
('CMP-20250522-001', 4, 4, 'LATE_DELIVERY',
    N'Hàng tôm đông lạnh nhập kho trễ 2 ngày so với lịch hẹn.',
    'RESOLVED', 3, '2025-05-29 10:00:00');
 
-- 37. Service Feedback
INSERT INTO ServiceFeedback (CustomerID, OrderID, StarRating, Comment) VALUES
(1, 1, 5, N'Dịch vụ tốt, nhân viên nhiệt tình, hàng giao đúng hẹn.'),
(2, 2, 3, N'Thời gian chờ cổng hơi lâu nhưng nhìn chung ổn.'),
(3, 3, 4, N'Kho lạnh chất lượng tốt, nhiệt độ đúng yêu cầu dược phẩm.');
 
-- 38. Adjustment Note
INSERT INTO AdjustmentNotes (NoteCode, NoteType, InvoiceID, CustomerID, Amount,
                              Reason, Status, ApprovedBy, ApprovedAt, CreatedBy) VALUES
('ADJ-2025-0001', 'CREDIT', 2, 2, 175000,
    N'Bồi thường 5 hộp iPhone bị hư hỏng theo SLA Premium.',
    'APPROVED', 1, '2025-05-25 10:00:00', 3);
 
-- 39. Vehicle Maintenance Logs
INSERT INTO VehicleMaintenanceLogs (VehicleID, MaintenanceType, ServiceDate, NextServiceDate,
                                     ServiceCenter, CostAmount) VALUES
(1, 'PERIODIC', '2025-03-01', '2025-09-01', N'Trung tâm Bảo Dưỡng Isuzu TP.HCM', 4500000),
(2, 'INSPECTION','2025-04-15', '2026-04-15', N'Đăng kiểm 50-06',                   350000),
(3, 'REPAIR',    '2025-05-01', '2025-11-01', N'Gara Hoàng Long',                    1200000);
 
-- 40. AI Parameters
INSERT INTO AIParameters (ParamKey, ParamValue, Description, UpdatedBy) VALUES
('ALPR_CONFIDENCE_THRESHOLD',   '95.0',   N'Ngưỡng tin cậy nhận diện biển số (%)', 1),
('OCR_CONFIDENCE_THRESHOLD',    '85.0',   N'Ngưỡng OCR – dưới mức này yêu cầu kiểm tra thủ công', 1),
('SLOTTING_HEAVY_FLOOR_LIMIT',  '1',      N'Hàng nặng chỉ xếp tầng trệt (FloorLevel)', 1),
('DISPATCH_PERISHABLE_BONUS',   '50',     N'Điểm ưu tiên bổ sung cho hàng tươi sống', 1),
('STOCK_ALERT_DEBOUNCE_HOURS',  '12',     N'Thời gian debounce gửi cảnh báo tồn kho', 1),
('STOCK_SCAN_INTERVAL_MINUTES', '30',     N'Chu kỳ quét tồn kho (phút)', 1),
('OVERSTAY_ALERT_MINUTES',      '120',    N'Thời gian cảnh báo xe lưu bãi quá hạn', 1),
('TEMP_VEHICLE_EXPIRY_DAYS',    '7',      N'Số ngày giữ hồ sơ xe tạm chưa duyệt', 1),
('DEAD_STOCK_DAYS',             '90',     N'Số ngày tồn kho coi là dead stock', 1),
('EXPIRY_WARNING_DAYS',         '30',     N'Cảnh báo hàng sắp hết hạn trước N ngày', 1),
('AI_FORECAST_RETRAIN_DAY',     '1',      N'Ngày retrain model dự báo tài chính mỗi tháng', 1),
('AI_FORECAST_HISTORY_MONTHS',  '6',      N'Số tháng dữ liệu tối thiểu để train model', 1),
('STOCKTAKE_VARIANCE_ALERT_PCT','10.0',   N'Cảnh báo chênh lệch kiểm kê vượt N%', 1),
('COMPLAINT_DEADLINE_DAYS',     '7',      N'Hạn tạo ticket khiếu nại sau khi đơn hoàn thành', 1),
('CUSTOMER_TIER_REVIEW_DAY',    '31',     N'Ngày cuối tháng chạy phân hạng khách hàng', 1);
 
-- 41. FAQ Items
INSERT INTO FAQItems (Category, Question, Answer, Tags, CreatedBy) VALUES
(N'Xuất kho', N'Quy trình xuất kho hàng thường như thế nào?',
    N'1. Tạo lệnh xuất trên hệ thống → 2. In Picking List → 3. Nhân viên kho lấy hàng theo Bin → 4. Đóng gói và in nhãn QR → 5. Điều phối xe lấy hàng → 6. Check-out cổng.',
    'xuất kho,picking,quy trình', 1),
(N'Nhập kho', N'OCR hóa đơn không nhận diện được thì làm gì?',
    N'Khi AI OCR báo độ tin cậy < 85%, hệ thống tự động đánh dấu "Yêu cầu kiểm tra thủ công". Nhân viên cần xem lại ảnh hóa đơn và nhập tay thông tin còn thiếu trước khi hoàn thành phiếu nhập.',
    'OCR,nhập kho,AI', 2),
(N'Phương tiện', N'Xe không có trong hệ thống có vào cổng được không?',
    N'Camera ALPR sẽ phát hiện xe lạ và tự động tạo hồ sơ tạm (Pending Approval). Admin cần phê duyệt trong vòng 7 ngày, nếu không hồ sơ sẽ tự động xóa. Xe chỉ được mở cổng khi có Booking xác nhận hợp lệ.',
    'xe lạ,ALPR,cổng', 1),
(N'Tài chính', N'Hóa đơn quá hạn xử lý như thế nào?',
    N'Hệ thống tự động chuyển trạng thái sang "Quá hạn" vào 00:00 ngày đến hạn nếu chưa thanh toán đủ. Bộ phận tài chính sẽ nhận thông báo để liên hệ khách hàng. Khách hàng có thể bị tạm dừng dịch vụ nếu nợ quá 2 kỳ.',
    'hóa đơn,quá hạn,thanh toán', 6);
 
-- 42. Notification Configs
INSERT INTO NotificationConfigs (EventType, Channel, Template) VALUES
('SLOT_BOOKING_CONFIRMED', 'EMAIL',
    N'Kính gửi {{driver_name}}, lịch hẹn xe {{plate}} vào lúc {{time}} ngày {{date}} tại Cửa {{dock}} đã được xác nhận. Mã booking: {{booking_code}}. QR Code đính kèm.'),
('STOCK_ALERT_LOW',        'EMAIL',
    N'CẢNH BÁO: SKU {{sku_code}} – {{product_name}} đang có tồn kho {{current_qty}} kiện, thấp hơn ngưỡng an toàn {{min_qty}} kiện.'),
('INVOICE_OVERDUE',        'EMAIL',
    N'Kính gửi {{customer_name}}, hóa đơn {{invoice_no}} trị giá {{amount}} VNĐ đã quá hạn thanh toán. Vui lòng thanh toán ngay để tránh gián đoạn dịch vụ.'),
('VEHICLE_OVERSTAY',       'SMS',
    N'[SmartLog] Xe {{plate}} đã đậu tại Cửa {{dock}} quá {{minutes}} phút. Đề nghị di chuyển ngay.'),
('CUSTOMER_TIER_UPGRADE',  'EMAIL',
    N'Chúc mừng {{customer_name}}! Quý khách đã được nâng hạng lên {{new_tier}}. Ưu đãi mới sẽ áp dụng từ {{effective_date}}.'),
('COMPLAINT_UPDATE',       'EMAIL',
    N'Khiếu nại {{complaint_code}} của Quý khách đã được cập nhật trạng thái: {{status}}. Phản hồi: {{resolution_note}}.');
 
-- 43. API Integration Logs (mẫu)
INSERT INTO APIIntegrationLogs (APIName, Endpoint, Method, StatusCode, DurationMs, IsSuccess) VALUES
('GOOGLE_MAPS', 'https://maps.googleapis.com/maps/api/place/autocomplete/json', 'GET',  200, 145, 1),
('GOOGLE_MAPS', 'https://maps.googleapis.com/maps/api/place/autocomplete/json', 'GET',  200, 132, 1),
('BANK_WEBHOOK','https://api.smartlog.vn/webhooks/bank/bidv',                   'POST', 200,  88, 1),
('SMS_GATEWAY', 'https://api.esms.vn/MainService.svc/json/SendMultipleMessage',  'POST', 200, 210, 1),
('BANK_WEBHOOK','https://api.smartlog.vn/webhooks/bank/vcb',                    'POST', 500, 320, 0);
 
-- 44. Audit Log samples
INSERT INTO AuditLog (UserID, IPAddress, Action, TableName, RecordID, NewValue) VALUES
(1, '192.168.1.10', 'CREATE_USER',     'Users',      '7',  N'{"username":"cust.abcfood","role":"CUSTOMER"}'),
(2, '192.168.1.11', 'UPDATE_INVENTORY','Inventory',  '1',  N'{"qty_before":130,"qty_after":120}'),
(4, '192.168.1.12', 'CHECKIN_VEHICLE', 'GateLogs',   '1',  N'{"plate":"51C-12345","booking":"BK-20250510-001"}'),
(3, '192.168.1.13', 'APPROVE_WRITEOFF','StockWriteOffs','1',N'{"status":"APPROVED"}'),
(1, '192.168.1.10', 'UPDATE_AI_PARAM', 'AIParameters','1', N'{"key":"ALPR_CONFIDENCE_THRESHOLD","value":"95.0"}');
 
GO
 
-- ============================================================
-- VIEWS hỗ trợ BI Dashboard & Reporting (UC050, UC041)
-- ============================================================
 
-- View: Tồn kho tổng hợp theo SKU
CREATE VIEW vw_InventorySummary AS
SELECT
    s.SKUCode,
    s.ProductName,
    c.CompanyName       AS CustomerName,
    pc.CategoryName,
    SUM(i.Quantity)     AS TotalQty,
    s.SafetyMinQty,
    CASE WHEN SUM(i.Quantity) <= s.SafetyMinQty THEN 1 ELSE 0 END AS IsLowStock,
    MIN(i.ExpiryDate)   AS NearestExpiry,
    MIN(i.InboundDate)  AS OldestInbound,
    DATEDIFF(DAY, MIN(i.InboundDate), CAST(GETDATE() AS DATE)) AS DaysInStock
FROM Inventory i
JOIN SKUs s              ON i.SKUID   = s.SKUID
JOIN Customers c         ON s.CustomerID = c.CustomerID
LEFT JOIN ProductCategories pc ON s.CategoryID = pc.CategoryID
GROUP BY s.SKUID, s.SKUCode, s.ProductName, c.CompanyName,
         pc.CategoryName, s.SafetyMinQty;
GO
 
-- View: Tỷ lệ lấp đầy kho (Warehouse Utilization)
CREATE VIEW vw_WarehouseUtilization AS
SELECT
    w.WarehouseCode,
    w.WarehouseName,
    z.ZoneCode,
    z.ZoneName,
    z.ZoneType,
    COUNT(b.BinID)                                  AS TotalBins,
    SUM(CAST(b.IsOccupied AS INT))                  AS OccupiedBins,
    ROUND(SUM(CAST(b.IsOccupied AS FLOAT)) * 100.0
          / NULLIF(COUNT(b.BinID), 0), 2)           AS OccupancyPct
FROM Warehouses w
JOIN WarehouseZones z   ON w.WarehouseID = z.WarehouseID
JOIN WarehouseShelves s ON z.ZoneID      = s.ZoneID
JOIN WarehouseBins b    ON s.ShelfID     = b.ShelfID
WHERE w.IsActive = 1 AND b.IsActive = 1
GROUP BY w.WarehouseCode, w.WarehouseName, z.ZoneCode, z.ZoneName, z.ZoneType;
GO
 
-- View: Doanh thu theo tháng (UC041)
CREATE VIEW vw_MonthlyRevenue AS
SELECT
    YEAR(i.IssueDate)               AS RevenueYear,
    MONTH(i.IssueDate)              AS RevenueMonth,
    COUNT(i.InvoiceID)              AS TotalInvoices,
    SUM(i.SubTotal - i.DiscountAmt) AS NetRevenue,
    SUM(i.VATAmount)                AS TotalVAT,
    SUM(i.TotalAmount)              AS GrossRevenue,
    SUM(i.PaidAmount)               AS CollectedAmount,
    SUM(i.TotalAmount - i.PaidAmount) AS OutstandingAmount
FROM Invoices i
GROUP BY YEAR(i.IssueDate), MONTH(i.IssueDate);
GO
 
-- View: Hiệu suất xe - số chuyến hoàn thành (UC018, UC019)
CREATE VIEW vw_VehiclePerformance AS
SELECT
    v.TruckPlate,
    v.VehicleType,
    d.FullName          AS DefaultDriver,
    COUNT(gl.GateLogID) / 2 AS TotalTrips,   -- Mỗi chuyến = 1 CHECKIN + 1 CHECKOUT
    AVG(DATEDIFF(MINUTE,
        MIN_IN.EventAt, MAX_OUT.EventAt))    AS AvgDockMinutes
FROM Vehicles v
LEFT JOIN Drivers d     ON v.DefaultDriverID  = d.DriverID
LEFT JOIN GateLogs gl   ON v.VehicleID        = gl.VehicleID
LEFT JOIN (
    SELECT VehicleID, BookingID, EventAt
    FROM GateLogs WHERE EventType = 'CHECKIN'
) MIN_IN ON v.VehicleID = MIN_IN.VehicleID
LEFT JOIN (
    SELECT VehicleID, BookingID, EventAt
    FROM GateLogs WHERE EventType = 'CHECKOUT'
) MAX_OUT ON v.VehicleID = MAX_OUT.VehicleID
          AND MIN_IN.BookingID = MAX_OUT.BookingID
GROUP BY v.VehicleID, v.TruckPlate, v.VehicleType, d.FullName;
GO
 
-- View: Công nợ khách hàng (UC039)
CREATE VIEW vw_CustomerDebt AS
SELECT
    c.CustomerCode,
    c.CompanyName,
    c.Tier,
    COUNT(i.InvoiceID)                              AS TotalInvoices,
    SUM(i.TotalAmount)                              AS TotalBilled,
    SUM(i.PaidAmount)                               AS TotalPaid,
    SUM(i.TotalAmount - i.PaidAmount)               AS OutstandingDebt,
    SUM(CASE WHEN i.Status = 'OVERDUE' THEN i.TotalAmount - i.PaidAmount ELSE 0 END) AS OverdueDebt,
    MAX(i.DueDate)                                  AS LatestDueDate
FROM Customers c
JOIN Invoices i ON c.CustomerID = i.CustomerID
GROUP BY c.CustomerID, c.CustomerCode, c.CompanyName, c.Tier;
GO
 
-- View: Hàng dead stock & sắp hết hạn (UC007)
CREATE VIEW vw_DeadAndExpiryStock AS
SELECT
    s.SKUCode,
    s.ProductName,
    c.CompanyName       AS CustomerName,
    b.BinCode,
    i.Quantity,
    i.ExpiryDate,
    i.InboundDate,
    DATEDIFF(DAY, i.InboundDate, CAST(GETDATE() AS DATE)) AS DaysStored,
    DATEDIFF(DAY, CAST(GETDATE() AS DATE), i.ExpiryDate)  AS DaysToExpiry,
    CASE
        WHEN DATEDIFF(DAY, i.InboundDate, CAST(GETDATE() AS DATE)) > 90 THEN 'DEAD_STOCK'
        WHEN i.ExpiryDate IS NOT NULL
             AND DATEDIFF(DAY, CAST(GETDATE() AS DATE), i.ExpiryDate) <= 30 THEN 'EXPIRY_SOON'
        ELSE 'NORMAL'
    END AS AlertType
FROM Inventory i
JOIN SKUs s         ON i.SKUID = s.SKUID
JOIN Customers c    ON s.CustomerID = c.CustomerID
JOIN WarehouseBins b ON i.BinID = b.BinID
WHERE i.Quantity > 0
  AND (
    DATEDIFF(DAY, i.InboundDate, CAST(GETDATE() AS DATE)) > 90
    OR (i.ExpiryDate IS NOT NULL
        AND DATEDIFF(DAY, CAST(GETDATE() AS DATE), i.ExpiryDate) <= 30)
  );
GO
INSERT INTO StockAlerts (SKUID, AlertType, CurrentQty, ThresholdQty, EmailSentAt, NextAllowedAt, IsResolved, CreatedAt)
SELECT v.SKUID, v.AlertType, v.CurrentQty, v.ThresholdQty, v.EmailSentAt, v.NextAllowedAt, v.IsResolved, v.CreatedAt
FROM (VALUES
    -- LOW_STOCK – mức NGHIÊM TRỌNG (tồn*2 <= ngưỡng), đã gửi email, đang trong debounce 12h
    (1, 'LOW_STOCK', 18,  50, CAST('2026-06-20 07:30:00' AS DATETIME2), CAST('2026-06-20 19:30:00' AS DATETIME2), 0, CAST('2026-06-20 07:30:00' AS DATETIME2)),
    (3, 'LOW_STOCK',  6,  20, CAST('2026-06-20 06:10:00' AS DATETIME2), CAST('2026-06-20 18:10:00' AS DATETIME2), 0, CAST('2026-06-20 06:10:00' AS DATETIME2)),
    (7, 'LOW_STOCK', 12,  30, CAST('2026-06-19 22:00:00' AS DATETIME2), CAST('2026-06-20 10:00:00' AS DATETIME2), 0, CAST('2026-06-19 22:00:00' AS DATETIME2)),
    -- LOW_STOCK – mức CẢNH BÁO (chạm ngưỡng nhưng tồn*2 > ngưỡng), chưa gửi email
    (4, 'LOW_STOCK',  9,  10, NULL, NULL, 0, CAST('2026-06-20 08:00:00' AS DATETIME2)),
    (6, 'LOW_STOCK', 30,  50, NULL, NULL, 0, CAST('2026-06-20 08:00:00' AS DATETIME2)),
    -- EXPIRY_SOON – sắp hết hạn (để minh hoạ thẻ "Sắp hết hạn")
    (8, 'EXPIRY_SOON', 35, NULL, CAST('2026-06-18 09:00:00' AS DATETIME2), NULL, 0, CAST('2026-06-18 09:00:00' AS DATETIME2)),
    -- DEAD_STOCK – tồn lâu (để minh hoạ thẻ "Tồn kho lâu")
    (4, 'DEAD_STOCK', 9, NULL, NULL, NULL, 0, CAST('2026-06-15 09:00:00' AS DATETIME2))
) AS v(SKUID, AlertType, CurrentQty, ThresholdQty, EmailSentAt, NextAllowedAt, IsResolved, CreatedAt)
WHERE NOT EXISTS (
    SELECT 1 FROM StockAlerts sa
    WHERE sa.SKUID = v.SKUID
      AND sa.AlertType = v.AlertType
      AND (sa.IsResolved = 0 OR sa.IsResolved IS NULL)
);
GO

-- Insert into UC 002, 006 ======================================================

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

PRINT '--- 1. Bat dau chèn du lieu anh chup hang hoa (CargoPhotos) ---';

INSERT INTO CargoPhotos (LineID, PhotoURL, PhotoAngle, IsDamaged, TakenBy)
SELECT v.LineID, v.PhotoURL, v.PhotoAngle, v.IsDamaged, v.TakenBy
FROM (
    VALUES
        (3, 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d', 'FRONT', 1, 3),
        (3, 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492', 'SIDE', 1, 3),
        (3, 'https://images.unsplash.com/photo-1578575437130-527eed3abbec', 'DETAIL', 1, 3),
        (1, 'https://images.unsplash.com/photo-1519003722824-194d4455a60c', 'FRONT', 0, 2),
        (5, 'https://images.unsplash.com/photo-1553413077-190dd305871c', 'FRONT', 0, 2)
) AS v(LineID, PhotoURL, PhotoAngle, IsDamaged, TakenBy)
WHERE NOT EXISTS (
    SELECT 1
    FROM CargoPhotos cp
    WHERE cp.PhotoURL = v.PhotoURL
);
GO

PRINT '--- 2. Cap nhat ton kho SKU-PV001 de test gui email ---';

-- Thiet lap nguong an toan va ton kho thuc te cho Paracetamol (SKU-PV001)
UPDATE SKUs SET SafetyMinQty = 200 WHERE SKUCode = 'SKU-PV001';
UPDATE Inventory SET Quantity = 50 WHERE SKUID = 5;
GO

PRINT '--- 3. Lam moi danh sach canh bao ton kho (StockAlerts) ---';

-- Xoa bo cac canh bao cu de reset UI va luong test email
DELETE FROM StockAlerts;
GO

INSERT INTO StockAlerts (SKUID, AlertType, CurrentQty, ThresholdQty, EmailSentAt, NextAllowedAt, IsResolved, CreatedAt)
VALUES
    -- LOW_STOCK: Mức NGHIÊM TRỌNG (tồn <= 0 hoặc tồn*2 <= ngưỡng)
    (1, 'LOW_STOCK', 5, 50, GETDATE(), DATEADD(HOUR, 12, GETDATE()), 0, DATEADD(MINUTE, -120, GETDATE())),
    (3, 'LOW_STOCK', 2, 20, GETDATE(), DATEADD(HOUR, 12, GETDATE()), 0, DATEADD(MINUTE, -200, GETDATE())),
    (4, 'LOW_STOCK', 0, 10, GETDATE(), DATEADD(HOUR, 12, GETDATE()), 0, DATEADD(MINUTE, -300, GETDATE())),
    (7, 'LOW_STOCK', 3, 30, GETDATE(), DATEADD(HOUR, 12, GETDATE()), 0, DATEADD(HOUR, -2, GETDATE())),
    
    -- SKU-PV001: Kích hoạt điều kiện gửi email mới (EmailSentAt = NULL)
    (5, 'LOW_STOCK', 50, 200, NULL, NULL, 0, GETDATE()),

    -- LOW_STOCK: Mức CẢNH BÁO (chạm ngưỡng nhưng chưa quá thấp)
    (2, 'LOW_STOCK', 85, 100, NULL, NULL, 0, DATEADD(MINUTE, -90, GETDATE())),
    (6, 'LOW_STOCK', 45, 50, NULL, NULL, 0, DATEADD(HOUR, -5, GETDATE())),

    -- EXPIRY_SOON: Sắp hết hạn
    (8, 'EXPIRY_SOON', 35, 0, GETDATE(), NULL, 0, DATEADD(DAY, -1, GETDATE())),
    (7, 'EXPIRY_SOON', 120, 0, GETDATE(), NULL, 0, DATEADD(DAY, -2, GETDATE())),

    -- DEAD_STOCK: Tồn kho lâu
    (2, 'DEAD_STOCK', 120, 0, NULL, NULL, 0, DATEADD(DAY, -95, GETDATE())),
    (4, 'DEAD_STOCK', 5, 0, NULL, NULL, 0, DATEADD(DAY, -120, GETDATE())),
    (6, 'DEAD_STOCK', 1500, 0, NULL, NULL, 0, DATEADD(DAY, -200, GETDATE()));

GO
--===========================================
PRINT '============================================================';
PRINT ' SmartLog AI – Database created successfully!';
PRINT ' Tables: 40+ | Views: 6 | Sample records: 300+';
PRINT '============================================================';
GO