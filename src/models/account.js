'use strict';

const query = require('../services/db.js');
const utils = require('../services/utils.js');

class Account {
    constructor() {
    }
    static async changePassword(username, newPassword) {
        const sql = `
        UPDATE users
        SET password = ?
        WHERE username = ?`;
        const encryptedNewPassword = utils.encrypt(newPassword);
        const args = [encryptedNewPassword, username];
        const result = await query(sql, args);
        return result.affectedRows === 1;
    }
    static async getPassword(username) {
        const sql = `
        SELECT password
        FROM users
        WHERE username = ?
        `;
        const args = [username];
        const result = await query(sql, args);
        if (result && result.length > 0) {
            return result[0].password;
        }
        return null;
    }
    static async verifyAccount(username, password) {
        const encryptedPassword = await this.getPassword(username);
        const result = utils.verify(password, encryptedPassword);
        return result;
    }
}

module.exports = Account;