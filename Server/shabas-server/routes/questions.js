const express = require('express');
const router = express.Router();
const sql = require("../mssql");
const utils = require('../utils');
const { getPositiveInteger } = require('../requestParams');

router.get('/get_questions_by_bookid/:id', async (req, res) => {
    try {
        const chapterId = getPositiveInteger(req.params.id);
        const bookId = getPositiveInteger(req.query.bookId, 1);
        const userId = getPositiveInteger(req.query.userId, 1);

        if (chapterId === null || bookId === null || userId === null) {
            return res.status(400).json({
                error: 'chapterId, bookId, and userId must be positive integers'
            });
        }

        console.log("📌 API START get_questions_by_bookid");
        console.log("➡️ Params:", { chapterId, bookId, userId });

        const pool = await sql.getPool();

        // ---- 1. כל השאלות ----
        const results_questions = await pool.request()
            .input('BookID', sql.sql.Int, bookId)
            .input('ChapterID', sql.sql.Int, chapterId)
            .execute('FindChapteQList');

        console.log("📘 Questions returned:", results_questions.recordset.length);
        console.log(results_questions.recordset.map(q => ({ CID: q.CID, QTypeID: q.QTypeID })));

        const questions = results_questions.recordset;

        // ---- 2. כל האפשרויות ----
        const results_answers = await pool.request()
            .input('BookID', sql.sql.Int, bookId)
            .input('ChapterID', sql.sql.Int, chapterId)
            .execute('FindChapteQAnswer');

        // ---- 3. תשובות נכונות ----
        const correct_answers = await pool.request()
            .input('BookID', sql.sql.Int, bookId)
            .input('ChapterID', sql.sql.Int, chapterId)
            .execute('FindChapteQCorrectAnswer');

        // ---- 4. סינון שאלות פתוחות ----
        const openQuestions = questions.filter(q => q.QTypeID === 25);
        const openCIDs = openQuestions.map(q => q.CID);

        console.log("📝 Open Questions:", openCIDs);

        // ---- 5. שליפת תשובות משתמש לשאלות פתוחות בלבד ----
        let userAnswers = [];

        if (openCIDs.length > 0) {
            const cidCsv = openCIDs.join(',');

            console.log("📡 CALL SP: FindUserOpenAnswers WITH:", {
                userId,
                bookId,
                chapterId,
                cidCsv
            });

            const results_user_answers = await pool.request()
                .input('UserID', sql.sql.Int, userId)
                .input('BookID', sql.sql.Int, bookId)
                .input('ChapterID', sql.sql.Int, chapterId)
                .input('CIDList', sql.sql.VarChar, cidCsv)    // ⭐ שולחים SP רק שאלות פתוחות
                .execute('FindUserOpenAnswers');

            userAnswers = results_user_answers.recordset;

            console.log("📥 SP FindUserOpenAnswers returned:", userAnswers.length);
            console.log("📥 RAW RESULTS:", userAnswers);
        }

        // ---- 6. בניית מבנה השאלות ----
        const mapped_data = questions.map(q => {
            const latestAnswer =
                q.QTypeID === 25
                    ? userAnswers.find(a => a.CID === q.CID)
                    : null;

            console.log(`🔍 CID ${q.CID} — Matched answer:`, latestAnswer);

            return {
                id: q.CID,
                title: q.ContentDes,
                audio: q.AudioLink,
                type: utils.getQuestionType(q.QTypeID),
                explanation: q.Explanation,
                img: q.PicName,
                pageId: q.PageID,
                done: q.QAnswerdRight,
                userAnswer: latestAnswer ? latestAnswer.Answer : "",
                options: results_answers.recordset
                    .filter(a => a.CID === q.CID)
                    .map(a => ({
                        id: a.Line,
                        label: a.Des,
                        audio: a.AudioLink,
                        side: a.PlaceType
                    })),
                correctAnswerId: correct_answers.recordset
                    .filter(c => c.CID === q.CID)
                    .map(c => ({ [c.Line]: c.Ans }))
            };
        });

        console.log("✅ FINAL RESPONSE SENT");

        res.status(200).send(
            mapped_data.sort((a, b) => a.pageId - b.pageId)
        );

    } catch (e) {
        console.error("❌ ERROR in /get_questions_by_bookid:", e);
        res.status(500).send(e);
    }
});





router.get('/final_work_category', async (req, res) => {
    try {
        const bookId = getPositiveInteger(req.query.bookId, 1);
        if (bookId === null) {
            return res.status(400).json({ error: 'bookId must be a positive integer' });
        }

        const pool = await sql.getPool();

        const data = await pool.request()
            .input('BookID', sql.sql.Int, bookId)
            .execute("FindFinalExamChapteList");

        res.status(200).send(data);

    } catch (e) {
        console.log("Error occurred: ", e);
        res.status(500).send(e);
    }
});


router.get('/final_work_questions/:id', async (req, res) => {
    try {
        const chapterId = getPositiveInteger(req.params.id);
        const bookId = getPositiveInteger(req.query.bookId, 1);
        const userId = getPositiveInteger(req.query.userId, 1);

        if (chapterId === null || bookId === null || userId === null) {
            return res.status(400).json({
                error: 'chapterId, bookId, and userId must be positive integers'
            });
        }

        const pool = await sql.getPool();

        const data = await pool.request()
            .input('BookID', sql.sql.Int, bookId)
            .input('ChapterID', sql.sql.Int, chapterId)
            .execute("FindFinalExamChapteQList");

        const mapped_data = await Promise.all(
            data.recordset.map(async (question) => {
                const teachersNote = await pool.request()
                    .input('UserID', sql.sql.Int, userId)
                    .input('CID', sql.sql.Int, question.CID)
                    .execute("TeacherCommentsList");

                return {
                    id: question.CID,
                    title: question.ContentDes,
                    audio: question.AudioLink,
                    page: question.PageID,
                    explanation: question.Explanation,
                    type: utils.getQuestionType(question.QTypeID),
                    answer: question.Ans,
                    teachersNote: teachersNote.recordset
                };
            })
        );

        const json_data = mapped_data.reduce((acc, q) => {
            acc[q.id] = {
                id: q.id,
                title: q.title,
                type: q.type,
                audio: q.audio,
                page: q.page,
                pageId: q.page,
                explanation: q.explanation,
                done: typeof q.answer === 'string'
                    ? q.answer.trim().length > 0
                    : Boolean(q.answer),
                answer: q.answer,
                teachersNote: q.teachersNote
            };
            return acc;
        }, {});

        res.status(200).send(json_data);

    } catch (e) {
        console.log("Error occurred: ", e);
        res.status(500).send(e);
    }
});


const completeFinalWork = async (req, res) => {
    try {
        const chapterId = getPositiveInteger(req.body?.chapterId ?? req.query.chapterId);
        const userId = getPositiveInteger(req.body?.userId ?? req.query.userId, 1);
        const bookId = getPositiveInteger(req.body?.bookId ?? req.query.bookId, 1);

        if (chapterId === null || userId === null || bookId === null) {
            return res.status(400).json({
                error: 'chapterId, bookId, and userId must be positive integers'
            });
        }

        const pool = await sql.getPool();

        await pool.request()
            .input('UserID', sql.sql.Int, userId)
            .input('BookID', sql.sql.Int, bookId)
            .input('ChapterID', sql.sql.Int, chapterId)
            .execute("SetFinalExamCanBeSubmitted");

        res.status(200).send('success');

    } catch (e) {
        console.log("Error occurred: ", e);
        res.status(500).send(e);
    }
};

router.post('/complete_final_work', completeFinalWork);
router.get('/complete_final_work', completeFinalWork);


module.exports = router;
