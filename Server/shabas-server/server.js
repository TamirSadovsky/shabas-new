const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const { getPositiveInteger } = require('./requestParams');

const app = express();
const port = 3000;
const host = '127.0.0.1';

// MSSQL MODULE (FIXED)
const db = require("./mssql");

// ROUTES
const questionsRoute = require('./routes/questions');
const authRouter = require('./routes/auth');
const loggerRoute = require('./routes/logger');
const mediaRoute = require('./routes/media');

// STATIC FRONTEND (PRODUCTION)
app.use(express.static(path.join(__dirname, 'dist')));

// MIDDLEWARE
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ROUTES
app.use('/auth', authRouter);
app.use('/questions', questionsRoute);
app.use('/log', loggerRoute);
app.use('/', mediaRoute);

// ---------------------------
//       API ENDPOINTS
// ---------------------------

// ✔ FIXED: CURRENT USER
app.get('/current_user', async (req, res) => {
    try {
        const pool = await db.getPool();
        const data = await pool.request().execute("FindCurrUser");

        res.status(200).send(data.recordset[0]);
    } catch (e) {
        console.log("Error occurred: ", e);
        res.status(500).send(e);
    }
});

// POWER COMMAND WRAPPER
const execCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout);
        });
    });
};

// TEST ROUTE
app.get('/test', (req, res) => {
    res.status(200).json("works");
});

// BRIGHTNESS ROUTE
app.post('/brightness', async (req, res) => {
    try {
        const { value } = req.body;
        const brightness = Number(value);

        if (isNaN(brightness) || brightness < 0 || brightness > 100) {
            return res.status(400).json({ error: 'Invalid brightness value. Must be between 0 and 100.' });
        }

        const powerShellCommand =
            `powershell -command "(Get-WmiObject -Namespace root/WMI -Class WmiMonitorBrightnessMethods).WmiSetBrightness(1, ${brightness})"`;

        await execCommand(powerShellCommand);

        res.json({ success: true, brightness });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Failed to set brightness', details: error.message });
    }
});

// ACTIVE BOOKS
app.get('/books', async (req, res) => {
    try {
        const pool = await db.getPool();
        const result = await pool.request().query(`
            SELECT
                [BookID] AS [id],
                [Book] AS [name],
                CASE
                    WHEN NULLIF(LTRIM(RTRIM([BookImage])), '') IS NULL THEN 0
                    ELSE 1
                END AS [hasImage],
                CASE
                    WHEN NULLIF(LTRIM(RTRIM([AudioLink])), '') IS NULL THEN 0
                    ELSE 1
                END AS [hasAudio]
            FROM [dbo].[Books]
            WHERE ISNULL([NotActive], 0) = 0
            ORDER BY ISNULL([OrderID], 2147483647), [BookID]
        `);

        const books = result.recordset.map((book) => ({
            id: book.id,
            name: book.name,
            image: book.hasImage
                ? `/media/books/${book.id}/icon`
                : null,
            audioLink: book.hasAudio
                ? `/media/books/${book.id}/audio`
                : null
        }));

        res.status(200).json({ data: books });
    } catch (e) {
        console.error("Error loading books:", e);
        res.status(500).json({ error: 'Failed to load books' });
    }
});

// ✔ FIXED: CHAPTER LIST
app.get('/chapter_list', async (req, res) => {
    try {
        const bookId = getPositiveInteger(req.query.bookId, 1);
        if (bookId === null) {
            return res.status(400).json({ error: 'bookId must be a positive integer' });
        }

        const pool = await db.getPool();

        const data = await pool.request()
            .input('BookID', db.sql.Int, bookId)
            .execute('FindChapteList1');

        const transformedData = Object.values(data.recordset).reduce((acc, item) => {
            acc[item.ChapterID] = {
                level: item.NumAmswerd ?? 0,
                name: item.ChapterName,
                total: item.TotalQNum ?? 0,
                image: item.ChapterImage,
                audioLink: item.AudioLink,
                finalExam: item.FinalExamID,
                finalInProgress: item.FinalInProgress
            };
            return acc;
        }, {});

        res.status(200).send({ data: transformedData });

    } catch (e) {
        console.error("Error occurred:", e);
        res.status(500).send(e);
    }
});

// KILL SERVER ROUTE
app.post('/kill_server', async (req, res) => {
    try {
        if (CHROME_PROCESS) {
            process.kill(CHROME_PROCESS.pid);
        }
        process.exit(0);
    } catch (e) {
        console.error("Error occurred:", e);
        res.status(500).send(e);
    }
});

// FRONTEND FALLBACK
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ---------------------------
//       SERVER START
// ---------------------------

let CHROME_PROCESS;

const getChromePath = () => {
    const candidates = [
        process.env.CHROME_PATH,
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
    ].filter(Boolean);

    return candidates.find((candidate) => fs.existsSync(candidate));
};

const launchChrome = (url, detach = false) => {
    const chromePath = getChromePath();
    if (!chromePath) {
        console.error(`Chrome was not found. Open this URL manually: ${url}`);
        return;
    }

    const profileDir = path.join(os.tmpdir(), 'shabas-chrome-profile');
    CHROME_PROCESS = spawn(chromePath, [
        `--app=${url}`,
        `--user-data-dir=${profileDir}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-infobars',
        '--start-fullscreen',
        '--kiosk'
    ], detach ? { detached: true, stdio: 'ignore' } : {});

    if (detach) {
        CHROME_PROCESS.unref();
        return;
    }

    CHROME_PROCESS.on('error', (err) => {
        console.error('Error launching Chrome:', err);
    });

    CHROME_PROCESS.on('exit', (code, signal) => {
        console.log(`Chrome process exited with code ${code}, signal ${signal}`);
    });
};

const keepWindowOpen = (message) => {
    console.error(message);
    if (!process.pkg) {
        process.exit(1);
        return;
    }

    console.log('Press Enter to close this window...');
    process.stdin.resume();
    process.stdin.once('data', () => process.exit(1));
};

const listeningPort = Number(process.env.PORT) || port;
const appUrl = `http://${host}:${listeningPort}`;
const server = app.listen(listeningPort, host, () => {
    console.log(`Hello world app listening on ${appUrl}!`);
    launchChrome(appUrl);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.warn(`Port ${listeningPort} is already in use. Opening the existing app...`);
        launchChrome(appUrl, true);
        setTimeout(() => process.exit(0), 1500);
        return;
    }

    keepWindowOpen(`Failed to start the app: ${error.message}`);
});
