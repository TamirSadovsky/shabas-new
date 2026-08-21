const express = require('express');
const router = express.Router();
const axios = require('axios');
const sql = require("../mssql");
const jwt = require('jsonwebtoken');
require('dotenv').config();


// Getting user data.
router.get('/', async (req, res) => {
    const requestData = req.body;
  
    try {
        const userInfo = await sql.pool
        .request()
        .execute('FindCurrUser');
        res.status(200).send(userInfo.recordset[0]);
    } catch (e) {
        console.error("Error occurred: ", e);
        res.status(500).send(e);
    }
});


module.exports = router;

