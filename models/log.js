"use strict"

const fs = require('fs');
const path = require('path');
const query = require('../db.js');
const utils = require('../utils.js');

const logsDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

class Log {
    constructor(uuid, timestamp, message) {
        this.uuid = uuid;
        this.timestamp = timestamp;
        this.message = message;
    }
    static async getAll() {
        var logs = await query("SELECT uuid, timestamp, message FROM logs");
        return logs;
    }
    static async getByDevice(uuid) {
        var name = uuid + '.log';
        var logFile = path.resolve(logsDir, name);
        if (!fs.existsSync(logFile)) {
            return null;
        }
        var data = utils.readFile(logFile).split('\r\n');
        var logs = [];
        data.forEach(function(log) {
            if (log) {
                var l = JSON.parse(log);
                logs.push({
                    message: l.message,
                    date: utils.getDateTime(l.timestamp),
                    uuid: l.uuid
                });
            }
        });
        return logs;
    }
    static async create(uuid, message) {
        var name = uuid + '.log';
        var logFile = path.resolve(logsDir, name);
        var msg = {
            message: message,
            timestamp: new Date() / 1000,
            uuid: uuid
        };
        fs.appendFile(logFile, JSON.stringify(msg) + '\r\n', function (err) {
            if (err) throw err;
        });

        /*
        var sql = `
        INSERT INTO logs (uuid, timestamp, message)
        VALUES (?, UNIX_TIMESTAMP(), ?)`;
        var args = [uuid, message];
        var result = await query(sql, args);
        return result.affectedRows === 1;
        */
    }
    static async delete(uuid) {
        var name = uuid + '.log';
        var logFile = path.resolve(logsDir, name);
        if (fs.existsSync(logFile)) {
            fs.unlinkSync(logFile);
            return true;
        }
        return false;
        /*
        var sql = "DELETE FROM logs WHERE id = ?";
        var args = [id];
        var result = await query(sql, args);
        return result.affectedRows === 1;
        */
    }
    static async deleteAll() {
        /*
        var sql = "TRUNCATE TABLE logs";
        var result = await query(sql, []);
        return result.affectedRows > 0;
        */
        fs.readdir(logsDir, function(err, files) {
            if (err) throw err;
            files.forEach(function(file) {
                var logFile = path.join(logsDir, file);
                fs.unlink(logFile, function(err) {
                    if (err) throw err;
                });
            });
        });
    }
}

module.exports = Log;