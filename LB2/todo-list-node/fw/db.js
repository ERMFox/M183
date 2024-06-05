const mysql = require('mysql2/promise');
const dbConfig = require('../config');
const logHelper = require('../tools/log_helper')

// Verbindung zur Datenbank herstellen
async function connectDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('Database connected');
        return connection;
    } catch (error) {
        logHelper.log("Connection to Database", "system", "system", "local", error, "db.js");
        console.error('Error connecting to database:', error);
    }
}

async function executeStatement(statement) {
    let conn = await connectDB();
    const [results, fields] = await conn.query(statement);
    return results;
}

module.exports = { connectDB: connectDB, executeStatement: executeStatement };