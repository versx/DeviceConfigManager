'use strict';

const query = require('../services/db.js');
const logger = require('../services/logger.js');
const Migrator = require('../services/migrator.js');
const utils = require('../services/utils.js');

class Account {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
    static async create(username, password) {
        const exists = await this.exists(username);
        let result = false;
        if (exists) {
            result = await this.changePassword(username, password);
        } else {
            const encryptedPassword = utils.encrypt(password);
            const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
            const args = [username, encryptedPassword];
            const results = await query(sql, args);
            // TODO: Drop root if exists
            result = results && results.affectedRows === 1;
        }
        if (result) {
            await Migrator.setValueForKey('SETUP', true);
        }
        return result;
    }
    static async exists(username) {
        const sql = 'SELECT username FROM users WHERE username = ?';
        const args = [username];
        const result = await query(sql, args);
        return result && result.length === 1;
    }
    static async changePassword(username, newPassword) {
        const sql = `
        UPDATE users
        SET password = ?
        WHERE username = ?
        `;
        const encryptedNewPassword = utils.encrypt(newPassword);
        const args = [encryptedNewPassword, username];
        const result = await query(sql, args);
        return result && result.affectedRows === 1;
    }
    static async getAccount(username) {
        const sql = `
        SELECT username, password
        FROM users
        WHERE username = ?
        `;
        const args = [username];
        const result = await query(sql, args);
        if (result && result.length > 0) {
            return new Account(
                result[0].username,
                result[0].password
            );
        }
        return null;
    }
    static async verifyAccount(username, password) {
        const account = await this.getAccount(username);
        if (account === null) {
            logger('dcm').error('Failed to verify account information.');
            console.error('Failed to verify account information.');
            return null;
        }
        const result = utils.verify(password, account.password);
        return result;
    }
}

module.exports = Account;