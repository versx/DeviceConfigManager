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
    static async getByDevice(uuid) {
        var name = uuid + '.log';
        var logFile = path.resolve(logsDir, name);
        var exists = await fileExists(logFile);
        if (!exists) {
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
        var exists = await fileExists(logFile);
        if (exists) {
            var size = await fileSize(logFile) || 0;
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
    static async delete(uuid) {
        var name = uuid + '.log';
        var logFile = path.resolve(logsDir, name);
        var exists = await fileExists(logFile);
        if (exists) {
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
    static async getTotalSize() {
        var total = 0;
        var exists = await fileExists(logsDir);
        if (!exists) {
            return total;
        }
        var logs = fs.readdirSync(logsDir);
        if (logs && logs.length > 0) {
            logs.forEach(async function(log) {
                var logFile = path.join(logsDir, log);
                var logSize = await fileSize(logFile);
                total += logSize;
            });
        }
        return total;
    }
}

async function fileExists(path) {
    return new Promise(function(resolve, reject) {
        fs.access(path, fs.F_OK, function(err) {
            if (err) {
                return reject(err);
            }
            resolve(true);
        });
    });
}

async function fileSize(path) {
    return new Promise(function(resolve, reject) {
        fs.stat(path, function(err, stats) {
            if (err) {
                return reject(err);
            }
            resolve(stats.size);
        });
    });
}

function query(sql, args) {
    return new Promise(function(resolve, reject) {
        // The Promise constructor should catch any errors thrown on
        // this tick. Alternately, try/catch and reject(err) on catch.
        var conn = getConnection();
        /* eslint-disable no-unused-vars */
        conn.query(sql, args, function(err, rows, fields) {
        /* eslint-enable no-unused-vars */
            // Call reject on error states,
            // call resolve with results
            if (err) {
                return reject(err);
            }
            resolve(rows);
            conn.end(function(err, args) {
                if (err) {
                    console.error('Failed to close mysql connection:', args);
                    return;
                }
            });
        });
    });
}

module.exports = Log;