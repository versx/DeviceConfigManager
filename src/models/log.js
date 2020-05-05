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
    static async getByDevice(uuid) {
        var name = uuid + '.log';
        var logFile = path.resolve(logsDir, name);
        var exists = await utils.fileExists(logFile);
        if (!exists) {
            return null;
        }
        var logs = [];
        var data = await utils.readFile(logFile);
        var split = data.split('\r\n');
        if (split) {
            split.forEach(function(log) {
                if (log) {
                    var l = JSON.parse(log);
                    logs.push({
                        message: l.message,
                        date: l.timestamp
                    });
                }
            });
        }
        return logs;
    }
    static async delete(uuid) {
        var name = uuid + '.log';
        var logFile = path.resolve(logsDir, name);
        var exists = await utils.fileExists(logFile);
        if (exists) {
            fs.truncate(logFile, 0, function(err) { 
                if (err) {
                    console.error('Failed to clear log file', logFile);
                } else {
                    console.log('Cleared', uuid, 'log file.');
                }
            });
            //fs.unlinkSync(logFile);
            return true;
        }
        return false;
    }
    static deleteAll() {
        fs.readdir(logsDir, function(err, files) {
            if (err) {
                console.error('Failed to find log directory:', logsDir);
            }
            files.forEach(function(file) {
                var logFile = path.join(logsDir, file);
                fs.truncate(logFile, 0, function(err) { 
                    if (err) {
                        console.error('Failed to clear log file', logFile);
                    } else {
                        console.log('Cleared', logFile);
                    }
                });
                /*
                fs.unlink(logFile, function(err) {
                    if (err) {
                        console.error('Failed to delete log file:', logFile);
                    }
                });
                */
            });
        });
    }
    static async getTotalSize() {
        var exists = await utils.fileExists(logsDir);
        return new Promise((resolve, reject) => {
            if (!exists) {
                return reject(total);
            }
            var total = 0;
            var files = fs.readdirSync(logsDir);
            if (files) {
                files.forEach(function(file) {
                    var logFile = path.resolve(logsDir, file);
                    var stats = fs.statSync(logFile);
                    total += stats.size;
                });
            } else {
                return reject();
            }
            resolve(total);
        });
    }
}

module.exports = Log;