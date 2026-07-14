-- ============================================================
-- SmartLog AI – Database Schema Patch for UC004 Integration
-- Description: Ensures compatibility between baseline schema
--              (smartlogAI.sql) and UC004 C# Models / Services.
-- Idempotency: All statements check existences first.
-- ============================================================

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

USE SmartLogAI;
GO


-- 1. Check and add OutboundId column to Waybills
IF COL_LENGTH('dbo.Waybills', 'OutboundId') IS NULL
BEGIN
    PRINT 'Adding OutboundId column to Waybills...';
    ALTER TABLE dbo.Waybills ADD OutboundId INT NULL;
END
GO

-- 2. Check and alter QrCodeBase64 to be NULLable (nullable) in Waybills
-- (C# code initializes Waybill with QrCodeBase64 = null during generation)
IF EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.Waybills') 
      AND name = 'QrCodeBase64' 
      AND is_nullable = 0
)
BEGIN
    PRINT 'Altering QrCodeBase64 column in Waybills to be NULLable...';
    ALTER TABLE dbo.Waybills ALTER COLUMN QrCodeBase64 NVARCHAR(MAX) NULL;
END
GO

-- 3. Check and add FK_Waybills_OutboundOrders constraint
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name = 'FK_Waybills_OutboundOrders' 
      AND parent_object_id = OBJECT_ID('dbo.Waybills')
)
BEGIN
    PRINT 'Creating foreign key FK_Waybills_OutboundOrders...';
    ALTER TABLE dbo.Waybills ADD CONSTRAINT FK_Waybills_OutboundOrders
        FOREIGN KEY (OutboundId) REFERENCES dbo.OutboundOrders(OutboundID);
END
GO

-- 4. Check and add unique constraint/index for one Waybill per OutboundOrder
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes 
    WHERE name = 'UQ_Waybills_OutboundId' 
      AND object_id = OBJECT_ID('dbo.Waybills')
)
BEGIN
    PRINT 'Creating unique index UQ_Waybills_OutboundId...';
    CREATE UNIQUE INDEX UQ_Waybills_OutboundId 
        ON dbo.Waybills(OutboundId) 
        WHERE OutboundId IS NOT NULL;
END
GO

-- 5. Check and add RowVersion (concurrency token) to Inventory
IF COL_LENGTH('dbo.Inventory', 'RowVersion') IS NULL
BEGIN
    PRINT 'Adding RowVersion column to Inventory...';
    ALTER TABLE dbo.Inventory ADD RowVersion ROWVERSION NOT NULL;
END
GO

-- 6. Check and add RowVersion (concurrency token) to OutboundLines
IF COL_LENGTH('dbo.OutboundLines', 'RowVersion') IS NULL
BEGIN
    PRINT 'Adding RowVersion column to OutboundLines...';
    ALTER TABLE dbo.OutboundLines ADD RowVersion ROWVERSION NOT NULL;
END
GO

-- 7. Check and add CK_Inventory_Quantity check constraint (Quantity >= 0)
IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints 
    WHERE name = 'CK_Inventory_Quantity' 
      AND parent_object_id = OBJECT_ID('dbo.Inventory')
)
BEGIN
    PRINT 'Creating check constraint CK_Inventory_Quantity...';
    ALTER TABLE dbo.Inventory ADD CONSTRAINT CK_Inventory_Quantity 
        CHECK (Quantity >= 0);
END
GO
