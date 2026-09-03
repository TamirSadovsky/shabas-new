const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../mssql');
const { getPositiveInteger } = require('../requestParams');

const router = express.Router();

const ICON_EXTENSIONS = new Set([
    '.bmp',
    '.gif',
    '.jpeg',
    '.jpg',
    '.png',
    '.webp'
]);

const AUDIO_EXTENSIONS = new Set([
    '.aac',
    '.m4a',
    '.mp3',
    '.ogg',
    '.wav'
]);

const MEDIA_TYPES = Object.freeze({
    articles: {
        idColumn: 'ArtID',
        table: 'Articles',
        fields: {
            content: {
                column: 'ArtPath',
                extensions: new Set(['.pdf'])
            },
            icon: {
                column: 'IconImage',
                extensions: ICON_EXTENSIONS
            }
        }
    },
    audios: {
        idColumn: 'AudioID',
        table: 'Audios',
        fields: {
            content: {
                column: 'AudioPath',
                extensions: AUDIO_EXTENSIONS
            },
            icon: {
                column: 'IconImage',
                extensions: ICON_EXTENSIONS
            }
        }
    },
    videos: {
        idColumn: 'VideoID',
        table: 'Videos',
        fields: {
            content: {
                column: 'VideoPath',
                extensions: new Set(['.mp4', '.ogg', '.webm'])
            },
            icon: {
                column: 'IconImage',
                extensions: ICON_EXTENSIONS
            }
        }
    },
    books: {
        idColumn: 'BookID',
        table: 'Books',
        fields: {
            audio: {
                column: 'AudioLink',
                extensions: AUDIO_EXTENSIONS
            },
            icon: {
                column: 'BookImage',
                extensions: ICON_EXTENSIONS
            }
        }
    }
});

const hasValue = (value) => (
    typeof value === 'string' && value.trim().length > 0
);

const buildMediaUrl = (type, id, field) => (
    `/media/${type}/${id}/${field}`
);

const mapMediaRows = (rows, type) => rows.map((row) => ({
    id: row.id,
    name: row.name || '',
    contentUrl: row.hasContent
        ? buildMediaUrl(type, row.id, 'content')
        : null,
    iconUrl: row.hasIcon
        ? buildMediaUrl(type, row.id, 'icon')
        : null
}));

router.get('/home_media', async (req, res) => {
    try {
        const pool = await db.getPool();
        const result = await pool.request().query(`
            SELECT
                [ArtID] AS [id],
                [Name] AS [name],
                CASE
                    WHEN NULLIF(LTRIM(RTRIM([ArtPath])), '') IS NULL THEN 0
                    ELSE 1
                END AS [hasContent],
                CASE
                    WHEN NULLIF(LTRIM(RTRIM([IconImage])), '') IS NULL THEN 0
                    ELSE 1
                END AS [hasIcon]
            FROM [dbo].[Articles]
            WHERE ISNULL([NotActive], 0) = 0
            ORDER BY ISNULL([OrderID], 2147483647), [ArtID];

            SELECT
                [AudioID] AS [id],
                [Name] AS [name],
                CASE
                    WHEN NULLIF(LTRIM(RTRIM([AudioPath])), '') IS NULL THEN 0
                    ELSE 1
                END AS [hasContent],
                CASE
                    WHEN NULLIF(LTRIM(RTRIM([IconImage])), '') IS NULL THEN 0
                    ELSE 1
                END AS [hasIcon]
            FROM [dbo].[Audios]
            WHERE ISNULL([NotActive], 0) = 0
            ORDER BY ISNULL([OrderID], 2147483647), [AudioID];

            SELECT
                [VideoID] AS [id],
                [Name] AS [name],
                CASE
                    WHEN NULLIF(LTRIM(RTRIM([VideoPath])), '') IS NULL THEN 0
                    ELSE 1
                END AS [hasContent],
                CASE
                    WHEN NULLIF(LTRIM(RTRIM([IconImage])), '') IS NULL THEN 0
                    ELSE 1
                END AS [hasIcon]
            FROM [dbo].[Videos]
            WHERE ISNULL([NotActive], 0) = 0
            ORDER BY ISNULL([OrderID], 2147483647), [VideoID];
        `);

        const [articles = [], audios = [], videos = []] = result.recordsets;

        res.status(200).json({
            data: {
                articles: mapMediaRows(articles, 'articles'),
                audios: mapMediaRows(audios, 'audios'),
                videos: mapMediaRows(videos, 'videos')
            }
        });
    } catch (error) {
        console.error('Error loading home media:', error);
        res.status(500).json({ error: 'Failed to load home media' });
    }
});

router.get('/media/:type/:id/:field', async (req, res, next) => {
    const mediaType = MEDIA_TYPES[req.params.type];
    const mediaId = getPositiveInteger(req.params.id);
    const mediaField = mediaType?.fields[req.params.field];

    if (!mediaType || !mediaField || mediaId === null) {
        return res.status(404).json({ error: 'Media not found' });
    }

    try {
        const pool = await db.getPool();
        const result = await pool.request()
            .input('MediaID', db.sql.Int, mediaId)
            .query(`
                SELECT [${mediaField.column}] AS [filePath]
                FROM [dbo].[${mediaType.table}]
                WHERE [${mediaType.idColumn}] = @MediaID
                    AND ISNULL([NotActive], 0) = 0
            `);

        const filePath = result.recordset[0]?.filePath;
        if (!hasValue(filePath) || !path.isAbsolute(filePath.trim())) {
            return res.status(404).json({ error: 'Media file is not configured' });
        }

        const resolvedPath = path.normalize(filePath.trim());
        const extension = path.extname(resolvedPath).toLowerCase();
        if (!mediaField.extensions.has(extension)) {
            return res.status(415).json({ error: 'Unsupported media file type' });
        }

        let fileStats;
        try {
            fileStats = await fs.promises.stat(resolvedPath);
        } catch {
            return res.status(404).json({ error: 'Media file does not exist' });
        }

        if (!fileStats.isFile()) {
            return res.status(404).json({ error: 'Media file does not exist' });
        }

        res.setHeader('Cache-Control', 'no-cache, private');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.type(extension);
        return res.sendFile(resolvedPath, (error) => {
            if (!error) return;

            console.error('Error sending media file:', error);
            if (res.headersSent) {
                next(error);
                return;
            }

            res.status(error.statusCode || 500).json({
                error: 'Failed to send media file'
            });
        });
    } catch (error) {
        console.error('Error loading media file:', error);
        return res.status(500).json({ error: 'Failed to load media file' });
    }
});

module.exports = router;
