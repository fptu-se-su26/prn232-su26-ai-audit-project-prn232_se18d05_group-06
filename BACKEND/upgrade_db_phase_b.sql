IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('OutboundLines') AND name = 'RowVersion')
BEGIN
    ALTER TABLE OutboundLines ADD RowVersion ROWVERSION NOT NULL;
END
GO
