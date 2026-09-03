const fs = require("fs");
const path = require("path");
const sql = require("mssql");

function resolveEnvFile() {
    if (!process.pkg) {
        return undefined;
    }

    let envName = "prod.env";
    try {
        const configuredName = fs.readFileSync(
            path.join(__dirname, "packaged-env"),
            "utf8"
        ).trim();
        if (configuredName) {
            envName = configuredName;
        }
    } catch {
        // Keep the default packaged environment file.
    }

    return path.join(__dirname, envName);
}

const envFile = resolveEnvFile();
require("dotenv").config(envFile ? { path: envFile } : undefined);

const config = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    requestTimeout: 3600000,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

let pool;

async function getPool() {
    try {
        if (pool) {
            return pool; // already connected
        }

        pool = await sql.connect(config);
        console.log("✔ SQL connected");
        return pool;

    } catch (err) {
        console.error("❌ SQL CONNECTION ERROR:", err);
        pool = null;
        throw err;
    }
}

module.exports = {
    getPool,
    sql,
};
