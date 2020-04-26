'use strict';

const fs = require('fs');
const path = require('path');
const utils = require('../utils.js');
const config = require('../config.json');

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
    static create(uuid, message) {
        var name = uuid + '.log';
        var logFile = path.resolve(logsDir, name);
        if (fs.existsSync(logFile)) {
            var size = fs.statSync(logFile).size || 0;
            var maxSize = (config.logging.max_size || 5) * 1024 * 1024;
            if (size >= maxSize) {
                this.delete(uuid);
            }
        }
        var msg = {
            message: message,
            timestamp: new Date() / 1000,
            uuid: uuid
        };
        fs.appendFile(logFile, JSON.stringify(msg) + '\r\n', function (err) {
            if (err) throw err;
        });
    }
    static delete(uuid) {
        var name = uuid + '.log';
        var logFile = path.resolve(logsDir, name);
        if (fs.existsSync(logFile)) {
            fs.unlinkSync(logFile);
            return true;
        }
        return false;
    }
    static deleteAll() {
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
    static getTotalSize() {
        var total = 0;
        if (!fs.existsSync(logsDir)) {
            return total;
        }
        var logs = fs.readdirSync(logsDir);
        logs.forEach(function(log) {
            var logFile = path.join(logsDir, log);
            var stats = fs.statSync(logFile);
            total += stats.size;
        });
        return total;
    }
}

module.exports = Log;