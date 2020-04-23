'use strict';

const query = require('../db.js');


class Account {
    constructor() {
    }
    static async getAccount(username, password) {
        var sql = `
        SELECT username
        FROM users
        WHERE username = ? AND password = ?`;
        var args = [username, password];
        var results = await query(sql, args);
        return results && results.length > 0;
    }
    static async changePassword(username, password, newPassword) {
        var sql = `
        UPDATE users
        SET password = ?
        WHERE username = ? AND password = ?`;
        var args = [newPassword, username, password];
        var result = await query(sql, args);
        return result.affectedRows === 1;
    }
}

module.exports = Account;