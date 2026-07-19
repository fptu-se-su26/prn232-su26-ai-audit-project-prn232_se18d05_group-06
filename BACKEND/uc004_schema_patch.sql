-- ============================================================
-- SmartLog AI – Database Schema Patch for UC004 Integration
-- Target File: BACKEND/uc004_schema_patch.sql
-- Description: Ensures compatibility between base schema and UC004 models.
-- Idempotency: Uses safe existence checks (IF NOT EXISTS / IF COL_LENGTH)
-- ============================================================

SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

USE SmartLogAI;
GO

-- 1. Add RowVersion (timestamp/concurrency token) to Inventory if missing
IF COL_LENGTH('dbo.Inventory', 'RowVersion') IS NULL
BEGIN
    PRINT 'Adding RowVersion column to Inventory...';
    ALTER TABLE dbo.Inventory ADD RowVersion ROWVERSION NOT NULL;
END
GO

-- 2. Add RowVersion (timestamp/concurrency token) to OutboundLines if missing
IF COL_LENGTH('dbo.OutboundLines', 'RowVersion') IS NULL
BEGIN
    PRINT 'Adding RowVersion column to OutboundLines...';
    ALTER TABLE dbo.OutboundLines ADD RowVersion ROWVERSION NOT NULL;
END
GO

-- 3. Add OutboundId column to Waybills if missing
IF COL_LENGTH('dbo.Waybills', 'OutboundId') IS NULL
BEGIN
    PRINT 'Adding OutboundId column to Waybills...';
    ALTER TABLE dbo.Waybills ADD OutboundId INT NULL;
END
GO

-- 4. Add FK_Waybills_OutboundOrders constraint if missing
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

-- 5. Add unique filtered index on Waybills.OutboundId if missing
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
