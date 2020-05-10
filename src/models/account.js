'use strict';

const query = require('../services/db.js');

class Account {
    constructor() {
    }
    static async getAccount(username, password) {
        const sql = `
        SELECT username
        FROM users
        WHERE username = ? AND password = SHA1(?)`;
        const args = [username, password];
        const results = await query(sql, args);
        return results && results.length > 0;
    }
    static async changePassword(username, password, newPassword) {
        const sql = `
        UPDATE users
        SET password = SHA1(?)
        WHERE username = ? AND password = SHA1(?)`;
        const args = [newPassword, username, password];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Account;