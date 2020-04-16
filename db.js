"use strict"

const mysql = require('mysql');
const config = require('./config.json');
const conn = mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
    // TODO: Support charset
});

conn.connect(err => {
    if (err) {
        console.log('Error connecting to database');
        return;
    }
    console.log('Database connection established');
});

/*
conn.end((err) => {
    // The connection is terminated gracefully
    // Ensures all remaining queries are executed
    // Then sends a quit packet to the MySQL server.
});
*/

module.exports = conn;