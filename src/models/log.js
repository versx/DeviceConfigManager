'use strict';

const fs = require('fs');
const path = require('path');
const Device = require('../models/device.js');
const logger = require('../services/logger.js');
const utils = require('../services/utils.js');

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
    static async getAll() {
        const logs = [];
        const devices = await Device.getAll();
        for (let i = 0; i < devices.length; i++) {
            const device = devices[i];
            const logData = await this.getByDevice(device.uuid, true);
            for (let j = 0; j < logData.length; j++) {
                const log = logData[j];
                logs.push(log);
            }
        }
        return logs;
    }
    static async getByDevice(uuid, includeUuid = false) {
        const name = uuid + '.log';
        const logFile = path.resolve(logsDir, name);
        const exists = await utils.fileExists(logFile);
        const logs = [];
        if (!exists) {
            return logs;
        }
        const data = await utils.readFile(logFile);
        const split = data.split('\n');
        if (split) {
            split.forEach((log) => {
                if (log) {
                    const l = JSON.parse(log);
                    if (includeUuid) {
                        logs.push({
                            message: l.msg,
                            uuid: uuid,
                            date: utils.getDateTime(l.time)
                        });
                    } else {
                        logs.push({
                            message: l.msg,
                            date: utils.getDateTime(l.time)
                        });
                    }
                }
            });
        }
        return logs;
    }
    static async delete(uuid) {
        const name = uuid + '.log';
        const logFile = path.resolve(logsDir, name);
        const exists = await utils.fileExists(logFile);
        if (exists) {
            fs.truncate(logFile, 0, (err)  =>{ 
                if (err) {
                    logger('dcm').error(`Failed to clear log file ${logFile}`);
                } else {
                    logger('dcm').info(`Cleared ${uuid} log file.`);
                }
            });
            return true;
        }
        return false;
    }
    static deleteAll() {
        fs.readdir(logsDir, (err, files) => {
            if (err) {
                logger('dcm').error(`Failed to find log directory: ${logsDir}`);
            }
            files.forEach((file) => {
                const logFile = path.join(logsDir, file);
                fs.truncate(logFile, 0, (err) => { 
                    if (err) {
                        logger('dcm').error(`Failed to clear log file ${logFile}`);
                    } else {
                        logger('dcm').info(`Cleared ${logFile}`);
                    }
                });
            });
        });
    }
    static async getTotalSize() {
        const exists = await utils.fileExists(logsDir);
        return new Promise((resolve, reject) => {
            if (!exists) {
                return reject(total);
            }
            let total = 0;
            const files = fs.readdirSync(logsDir);
            if (files) {
                files.forEach((file) => {
                    const logFile = path.resolve(logsDir, file);
                    const stats = fs.statSync(logFile);
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