const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../mssql');

router.post('/insert_to_log', async (req, res) => {
    try {
        console.log("LOG BODY:", req.body);

        const {
            userId,
            categoryId,
            questionId,
            isQuestion,
            isCorrect,
            answer
        } = req.body;

        const bookId = 1;
        const pool = await getPool();               // ✔ תקין
        const request = pool.request();             // ✔ קיים

        await request
            .input('UserID', sql.Int, userId)
            .input('FTypeID', sql.Int, 0)
            .input('CID', sql.Int, questionId)
            .input('IsQ', sql.Bit, isQuestion)
            .input('QAnswerdRight', sql.Bit, isCorrect)
            .input('QDes', sql.NVarChar(sql.MAX), answer)
            .input('BookID', sql.Int, bookId)
            .input('ChapterID', sql.Int, categoryId)
            .execute('InsertToLog');

        console.log("✔ INSERTED LOG");

        res.status(200).json({ status: "Log saved" });

    } catch (e) {
        console.error("❌ error inserting to log:", e);
        res.status(400).json({ Error: e.message });
    }
});

router.post('/insert_to_log_final', async (req, res) => {
    try {
        console.log("FINAL LOG BODY:", req.body);

        const {
            userId,
            categoryId,
            questionId,
            answer
        } = req.body;

        const bookId = 1;
        const pool = await getPool();               // ✔ תקין
        const request = pool.request();             // ✔ קיים

        await request
            .input('UserID', sql.Int, userId)
            .input('BookID', sql.Int, bookId)
            .input('AnsDes', sql.NVarChar(sql.MAX), answer)
            .input('ChapterID', sql.Int, categoryId)
            .input('CID', sql.Int, questionId)
            .execute('InsertFinalExamAns');

        console.log("✔ INSERTED FINAL LOG");

        res.status(200).json({ status: "Final log saved" });

    } catch (e) {
        console.error("❌ error inserting to final log:", e);
        res.status(400).json({ Error: e.message });
    }
});

module.exports = router;
