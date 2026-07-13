-- Idempotent DB Migration Script for Waybills
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
SET QUOTED_IDENTIFIER ON;
GO

-- 1. Alter QrCodeBase64 to be nullable if it is currently NOT NULL
IF EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('Waybills') 
      AND name = 'QrCodeBase64' 
      AND is_nullable = 0
)
BEGIN
    ALTER TABLE Waybills
    ALTER COLUMN QrCodeBase64 NVARCHAR(MAX) NULL;
    PRINT 'Altered QrCodeBase64 to be NULL.';
END
ELSE
BEGIN
    PRINT 'QrCodeBase64 is already nullable.';
END
GO

-- 2. Add OutboundId column if it does not exist
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('Waybills') 
      AND name = 'OutboundId'
)
BEGIN
    ALTER TABLE Waybills
    ADD OutboundId INT NULL;
    PRINT 'Added OutboundId column.';
END
ELSE
BEGIN
    PRINT 'OutboundId column already exists.';
END
GO

-- 3. Add foreign key FK_Waybills_OutboundOrders if it does not exist
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys 
    WHERE name = 'FK_Waybills_OutboundOrders' 
      AND parent_object_id = OBJECT_ID('Waybills')
)
BEGIN
    ALTER TABLE Waybills
    ADD CONSTRAINT FK_Waybills_OutboundOrders
    FOREIGN KEY (OutboundId) REFERENCES OutboundOrders(OutboundID);
    PRINT 'Added foreign key FK_Waybills_OutboundOrders.';
END
ELSE
BEGIN
    PRINT 'Foreign key FK_Waybills_OutboundOrders already exists.';
END
GO

-- 4. Create filtered unique index UQ_Waybills_OutboundId if it does not exist
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes 
    WHERE name = 'UQ_Waybills_OutboundId' 
      AND object_id = OBJECT_ID('Waybills')
)
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UQ_Waybills_OutboundId
    ON Waybills(OutboundId)
    WHERE OutboundId IS NOT NULL;
    PRINT 'Created unique index UQ_Waybills_OutboundId.';
END
ELSE
BEGIN
    PRINT 'Unique index UQ_Waybills_OutboundId already exists.';
END
GO
