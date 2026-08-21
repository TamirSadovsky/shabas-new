const sql = require("mssql");
require("dotenv").config();

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
