'use strict';

const fs = require('fs');
const path = require('path');
const utils = require('../utils.js');

const logsDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

class Log {
    constructor(uuid, timestamp, message) {
        this.uuid = uuid;
        this.timestamp = timestamp;
        this.message = message;
    }
    static getByDevice(uuid) {
        const name = uuid + '.log';
        const logFile = path.resolve(logsDir, name);
        if (!fs.existsSync(logFile)) {
            return null;
        }
        const data = utils.readFile(logFile).split('\r\n');
        const logs = [];
        data.forEach(log => {
            if (log) {
                const l = JSON.parse(log);
                logs.push({
                    message: l.message,
                    date: utils.getDateTime(l.timestamp),
                    uuid: l.uuid
                });
            }
        });
        return logs;
    }
    static create(uuid, message) {
        const name = uuid + '.log';
        const logFile = path.resolve(logsDir, name);
        const msg = {
            message: message,
            timestamp: new Date() / 1000,
            uuid: uuid
        };
        fs.appendFile(logFile, JSON.stringify(msg) + '\r\n', err => {
            if (err) throw err;
        });
    }
    static delete(uuid) {
        const name = uuid + '.log';
        const logFile = path.resolve(logsDir, name);
        if (fs.existsSync(logFile)) {
            fs.unlinkSync(logFile);
            return true;
        }
        return false;
    }
    static deleteAll() {
        fs.readdir(logsDir, (err, files) => {
            if (err) throw err;
            files.forEach(file => {
                const logFile = path.join(logsDir, file);
                fs.unlink(logFile, err => {
                    if (err) throw err;
                });
            });
        });
    }
}

module.exports = Log;