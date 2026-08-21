const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const { spawn } = require('child_process');

const app = express();
const port = 3000;

// MSSQL MODULE (FIXED)
const db = require("./mssql");

// ROUTES
const questionsRoute = require('./routes/questions');
const authRouter = require('./routes/auth');
const loggerRoute = require('./routes/logger');

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

// ✔ FIXED: CHAPTER LIST
app.get('/chapter_list', async (req, res) => {
    try {
        const pool = await db.getPool();

        const data = await pool.request()
            .input('BookID', db.sql.Int, 1)
            .execute('FindChapteList1');

        const transformedData = Object.values(data.recordset).reduce((acc, item) => {
            acc[item.ChapterID] = {
                level: item.NumAmswerd,
                name: item.ChapterName,
                total: item.TotalQNum,
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

app.listen(process.env.PORT || port, () => {
    console.log(`Hello world app listening on port ${port}!`);

    const chromePath = `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`;

    // Launch Chrome in kiosk mode
    CHROME_PROCESS = spawn(chromePath, [
        `--app=http://localhost:${port}`,
        '--disable-infobars',
        '--full-screen',
        '--kiosk'
    ]);

    CHROME_PROCESS.on('error', (err) => {
        console.error('Error launching Chrome:', err);
    });

    CHROME_PROCESS.on('exit', (code, signal) => {
        console.log(`Chrome process exited with code ${code}, signal ${signal}`);
    });
});
