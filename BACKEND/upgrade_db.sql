-- 1. Check if RowVersion column exists on Inventory table
IF NOT EXISTS (
    SELECT 1 
    FROM sys.columns 
    WHERE object_id = OBJECT_ID('Inventory') AND name = 'RowVersion'
)
BEGIN
    ALTER TABLE Inventory ADD RowVersion ROWVERSION NOT NULL;
    PRINT 'Added RowVersion column to Inventory table.';
END
ELSE
BEGIN
    PRINT 'RowVersion column already exists on Inventory table.';
END

-- 2. Check if CK_Inventory_Quantity check constraint exists on Inventory table
IF NOT EXISTS (
    SELECT 1 
    FROM sys.check_constraints 
    WHERE parent_object_id = OBJECT_ID('Inventory') AND name = 'CK_Inventory_Quantity'
)
BEGIN
    ALTER TABLE Inventory ADD CONSTRAINT CK_Inventory_Quantity CHECK (Quantity >= 0);
    PRINT 'Added CK_Inventory_Quantity check constraint to Inventory table.';
END
ELSE
BEGIN
    PRINT 'CK_Inventory_Quantity check constraint already exists on Inventory table.';
END
GO
