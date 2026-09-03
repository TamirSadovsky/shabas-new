const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const express = require('express');
const db = require('./mssql');

const originalGetPool = db.getPool;
let queryHandler;

db.getPool = async () => ({
    request: () => {
        const inputs = {};
        return {
            input(name, type, value) {
                inputs[name] = value;
                return this;
            },
            query(sqlText) {
                return queryHandler(sqlText, inputs);
            }
        };
    }
});

const mediaRouter = require('./routes/media');

let baseUrl;
let server;
let temporaryDirectory;
let videoPath;
let unsupportedPath;

before(async () => {
    temporaryDirectory = await fs.mkdtemp(
        path.join(os.tmpdir(), 'shabas media ')
    );
    videoPath = path.join(temporaryDirectory, 'סרטון בדיקה.mp4');
    unsupportedPath = path.join(temporaryDirectory, 'not-media.txt');

    await fs.writeFile(videoPath, Buffer.from('0123456789'));
    await fs.writeFile(unsupportedPath, 'unsupported');

    const app = express();
    app.use(mediaRouter);
    server = http.createServer(app);

    await new Promise((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
    db.getPool = originalGetPool;
    await new Promise((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
    });
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
});

test('home media response contains URLs but no filesystem paths', async () => {
    queryHandler = async () => ({
        recordsets: [
            [{ id: 1, name: 'Article', hasContent: 1, hasIcon: 1 }],
            [{ id: 2, name: 'Audio', hasContent: 1, hasIcon: 0 }],
            [{ id: 3, name: 'Video', hasContent: 0, hasIcon: 1 }]
        ]
    });

    const response = await fetch(`${baseUrl}/home_media`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
        data: {
            articles: [{
                id: 1,
                name: 'Article',
                contentUrl: '/media/articles/1/content',
                iconUrl: '/media/articles/1/icon'
            }],
            audios: [{
                id: 2,
                name: 'Audio',
                contentUrl: '/media/audios/2/content',
                iconUrl: null
            }],
            videos: [{
                id: 3,
                name: 'Video',
                contentUrl: null,
                iconUrl: '/media/videos/3/icon'
            }]
        }
    });
    assert.equal(JSON.stringify(body).includes(temporaryDirectory), false);
});

test('video endpoint supports partial content and Unicode file paths', async () => {
    queryHandler = async (sqlText, inputs) => {
        assert.match(sqlText, /\[dbo\]\.\[Videos\]/);
        assert.equal(inputs.MediaID, 7);
        return { recordset: [{ filePath: videoPath }] };
    };

    const response = await fetch(`${baseUrl}/media/videos/7/content`, {
        headers: { Range: 'bytes=0-3' }
    });
    const body = Buffer.from(await response.arrayBuffer());

    assert.equal(response.status, 206);
    assert.equal(response.headers.get('content-range'), 'bytes 0-3/10');
    assert.equal(response.headers.get('content-type'), 'video/mp4');
    assert.equal(body.toString(), '0123');
});

test('media endpoint rejects unsupported extensions', async () => {
    queryHandler = async () => ({
        recordset: [{ filePath: unsupportedPath }]
    });

    const response = await fetch(`${baseUrl}/media/videos/7/content`);
    const body = await response.json();

    assert.equal(response.status, 415);
    assert.equal(body.error, 'Unsupported media file type');
});

test('media endpoint returns 404 for missing and invalid media', async () => {
    queryHandler = async () => ({
        recordset: [{
            filePath: path.join(temporaryDirectory, 'missing.mp4')
        }]
    });

    const missingResponse = await fetch(
        `${baseUrl}/media/videos/7/content`
    );
    const invalidResponse = await fetch(
        `${baseUrl}/media/unknown/7/content`
    );

    assert.equal(missingResponse.status, 404);
    assert.equal(invalidResponse.status, 404);
});
