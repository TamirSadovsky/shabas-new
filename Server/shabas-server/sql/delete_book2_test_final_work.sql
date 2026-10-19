-- Removes the book 2 test final work ("עבודת גמר לספר בדיקה").
-- Until this runs, that row still counts and the button stays visible on book 2.
-- Safe to run twice.

IF EXISTS (
    SELECT 1
    FROM dbo.FinalExamQMain
    WHERE BookID = 2
      AND ChapterID = 101
      AND CID = 900002
)
    DELETE FROM dbo.FinalExamQMain
    WHERE BookID = 2
      AND ChapterID = 101
      AND CID = 900002;
GO

IF EXISTS (
    SELECT 1
    FROM dbo.FinalExamChaptersList
    WHERE BookID = 2
      AND ChapterID = 101
      AND ChapterName = N'עבודת גמר לספר בדיקה'
)
    DELETE FROM dbo.FinalExamChaptersList
    WHERE BookID = 2
      AND ChapterID = 101
      AND ChapterName = N'עבודת גמר לספר בדיקה';
GO
