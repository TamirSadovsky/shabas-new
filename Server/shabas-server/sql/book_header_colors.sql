IF COL_LENGTH('dbo.Books', 'HeaderBgColor') IS NULL
    ALTER TABLE dbo.Books ADD HeaderBgColor nvarchar(30) NULL;
GO

IF COL_LENGTH('dbo.Books', 'HeaderTextColor') IS NULL
    ALTER TABLE dbo.Books ADD HeaderTextColor nvarchar(30) NULL;
GO

-- Example:
-- UPDATE dbo.Books SET HeaderBgColor = '#2E7D5B', HeaderTextColor = '#FFFFFF' WHERE BookID = 2;
