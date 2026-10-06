/*
    Connect-the-dots (QTypeID 23): many-to-many support

    Run the parts in order (each part ends with GO). Safe to run more than once.

    1. ContentMain.ConnectMode column
         NULL / 0 = many-to-many (default)
         1        = one-to-one (drawing a new line replaces lines on those dots)
    2. FindChapteQList returns ConnectMode (same procedure, one extra column)
    3. vConnectAnswers                 - read the correct pairs with their texts
    4. SetConnectAnswers @CID, @Pairs  - replace the correct pairs of one question
    5. Existing one-to-one questions get ConnectMode = 1 so they behave as before
       (only rows where ConnectMode IS NULL; never overrides a value set by hand)

    Pairs format for SetConnectAnswers: 'Line-Ans,Line-Ans,...'
      Line = ContentSub.Line with PlaceType 0 (word side)
      Ans  = ContentSub.Line with PlaceType 1 (category side)

    Examples:
      UPDATE ContentMain SET ConnectMode = NULL WHERE CID = 22010;   -- many-to-many
      UPDATE ContentMain SET ConnectMode = 1    WHERE CID = 42;      -- one-to-one
      EXEC SetConnectAnswers 22010, '1-20,2-23,3-19,4-20,9-20,3-21';
      SELECT * FROM vConnectAnswers WHERE CID = 22010 ORDER BY Line, Ans;
*/

/* ---------- 1. ConnectMode column ---------- */
IF COL_LENGTH('dbo.ContentMain', 'ConnectMode') IS NULL
    ALTER TABLE [dbo].[ContentMain] ADD [ConnectMode] smallint NULL;
GO

/* ---------- 2. FindChapteQList + ConnectMode ---------- */
IF OBJECT_ID('dbo.FindChapteQList', 'P') IS NULL
    EXEC('CREATE PROCEDURE [dbo].[FindChapteQList] AS RETURN');
GO

ALTER PROCEDURE [dbo].[FindChapteQList]
	@BookID int
	,@ChapterID int

AS
	SET NOCOUNT ON
	SET XACT_ABORT ON

	BEGIN TRAN

SELECT TOP (1000) a.[CID]
      ,a.[BookID]
      ,a.[ChapterID]
      ,[PageID]
      ,[Type]
      ,[QTypeID]
      ,[ContentDes]
      ,[BgType]
      ,[AudioLink]
      ,[VideoLink]
      ,[ToolTipID]
      ,[Explanation]
      ,[PicName]
      ,[ConnectMode]
      ,max([QAnswerdRight]) as QAnswerdRight
	  FROM [Shabas].[dbo].[ContentMain] as a left join [Shabas].[dbo].[UsersLogs] as b on a.[CID]=b.[CID]
  where a.[BookID]=@BookID and a.[ChapterID]=@ChapterID
  group by a.[CID]
      ,a.[BookID]
      ,a.[ChapterID]
      ,[PageID]
      ,[Type]
      ,[QTypeID]
      ,[ContentDes]
      ,[BgType]
      ,[AudioLink]
      ,[VideoLink]
      ,[ToolTipID]
      ,[Explanation]
      ,[PicName]
      ,[ConnectMode]
  order by a.[PageID]

COMMIT
GO

/* ---------- 3. vConnectAnswers ---------- */
IF OBJECT_ID('dbo.vConnectAnswers', 'V') IS NULL
    EXEC('CREATE VIEW [dbo].[vConnectAnswers] AS SELECT 1 AS x');
GO

ALTER VIEW [dbo].[vConnectAnswers]
AS
SELECT
    m.[CID]
    ,m.[BookID]
    ,m.[ChapterID]
    ,m.[ConnectMode]
    ,a.[Line]
    ,w.[Des] AS [WordText]
    ,a.[Ans]
    ,c.[Des] AS [CategoryText]
FROM [dbo].[ContentAns] a
JOIN [dbo].[ContentMain] m ON m.[CID] = a.[CID] AND m.[QTypeID] = 23
LEFT JOIN [dbo].[ContentSub] w ON w.[CID] = a.[CID] AND w.[Line] = a.[Line]
LEFT JOIN [dbo].[ContentSub] c ON c.[CID] = a.[CID] AND c.[Line] = a.[Ans];
GO

/* ---------- 4. SetConnectAnswers ---------- */
IF OBJECT_ID('dbo.SetConnectAnswers', 'P') IS NULL
    EXEC('CREATE PROCEDURE [dbo].[SetConnectAnswers] AS RETURN');
GO

ALTER PROCEDURE [dbo].[SetConnectAnswers]
    @CID int
    ,@Pairs nvarchar(max)
AS
    SET NOCOUNT ON
    SET XACT_ABORT ON

    IF NOT EXISTS (SELECT 1 FROM [dbo].[ContentMain] WHERE [CID] = @CID AND [QTypeID] = 23)
    BEGIN
        RAISERROR(N'CID %d is not a connect-the-dots question (QTypeID 23).', 16, 1, @CID);
        RETURN;
    END

    DECLARE @Parsed TABLE ([Line] int NOT NULL, [Ans] int NOT NULL);
    DECLARE @Rest nvarchar(max) = REPLACE(REPLACE(ISNULL(@Pairs, N''), N' ', N''), N';', N',') + N',';
    DECLARE @Item nvarchar(100), @Pos int, @Dash int;

    WHILE LEN(@Rest) > 0
    BEGIN
        SET @Pos = CHARINDEX(N',', @Rest);
        SET @Item = LEFT(@Rest, @Pos - 1);
        SET @Rest = SUBSTRING(@Rest, @Pos + 1, LEN(@Rest));

        IF LEN(@Item) = 0 CONTINUE;

        SET @Dash = CHARINDEX(N'-', @Item);
        IF @Dash < 2 OR TRY_CAST(LEFT(@Item, @Dash - 1) AS int) IS NULL
                     OR TRY_CAST(SUBSTRING(@Item, @Dash + 1, 20) AS int) IS NULL
        BEGIN
            RAISERROR(N'Bad pair "%s". Use Line-Ans, e.g. 1-20.', 16, 1, @Item);
            RETURN;
        END

        INSERT INTO @Parsed ([Line], [Ans])
        VALUES (CAST(LEFT(@Item, @Dash - 1) AS int), CAST(SUBSTRING(@Item, @Dash + 1, 20) AS int));
    END

    IF NOT EXISTS (SELECT 1 FROM @Parsed)
    BEGIN
        RAISERROR(N'No pairs given.', 16, 1);
        RETURN;
    END

    DECLARE @BadLine int = (
        SELECT TOP 1 p.[Line] FROM @Parsed p
        WHERE NOT EXISTS (SELECT 1 FROM [dbo].[ContentSub] s
                          WHERE s.[CID] = @CID AND s.[Line] = p.[Line] AND s.[PlaceType] = 0));
    IF @BadLine IS NOT NULL
    BEGIN
        RAISERROR(N'Line %d is not a word (PlaceType 0) of CID %d.', 16, 1, @BadLine, @CID);
        RETURN;
    END

    DECLARE @BadAns int = (
        SELECT TOP 1 p.[Ans] FROM @Parsed p
        WHERE NOT EXISTS (SELECT 1 FROM [dbo].[ContentSub] s
                          WHERE s.[CID] = @CID AND s.[Line] = p.[Ans] AND s.[PlaceType] = 1));
    IF @BadAns IS NOT NULL
    BEGIN
        RAISERROR(N'Ans %d is not a category (PlaceType 1) of CID %d.', 16, 1, @BadAns, @CID);
        RETURN;
    END

    BEGIN TRAN
        DELETE FROM [dbo].[ContentAns] WHERE [CID] = @CID;

        INSERT INTO [dbo].[ContentAns] ([CID], [Line], [Ans], [Ans2])
        SELECT DISTINCT @CID, [Line], [Ans], NULL FROM @Parsed;
    COMMIT

    SELECT * FROM [dbo].[vConnectAnswers] WHERE [CID] = @CID ORDER BY [Line], [Ans];
GO

/* ---------- 5. Keep existing one-to-one questions as before ---------- */
UPDATE m
SET m.[ConnectMode] = 1
FROM [dbo].[ContentMain] m
WHERE m.[QTypeID] = 23
  AND m.[ConnectMode] IS NULL
  AND EXISTS (SELECT 1 FROM [dbo].[ContentAns] a WHERE a.[CID] = m.[CID])
  AND NOT EXISTS (
        SELECT 1 FROM [dbo].[ContentAns] a
        WHERE a.[CID] = m.[CID]
        GROUP BY a.[Line]
        HAVING COUNT(DISTINCT a.[Ans]) > 1)
  AND NOT EXISTS (
        SELECT 1 FROM [dbo].[ContentAns] a
        WHERE a.[CID] = m.[CID]
        GROUP BY a.[Ans]
        HAVING COUNT(DISTINCT a.[Line]) > 1);
GO

SELECT [CID], [BookID], [ChapterID], [ContentDes], [ConnectMode]
FROM [dbo].[ContentMain]
WHERE [QTypeID] = 23
ORDER BY [BookID], [ChapterID], [PageID];
GO
