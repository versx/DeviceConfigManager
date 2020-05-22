'use strict';

const pino = require('pino');
const path = require('path');
const logrotate = require('logrotator');
const config = require('../config.json');
const logsDir = path.resolve(__dirname, '../../logs');

// Global log rotator
const rotator = logrotate.rotator;
const loggers = {};

export const getLogger = (name) => {
    // Logger with name was already created, no need to create another.
    if (loggers[name]) {
        return loggers[name];
    }

    const logFilePath = path.resolve(logsDir, name + '.log');
    const logger = pino(pino.destination({
        dest: logFilePath,
        //minLength: 4096, // Buffer before writing
        sync: false,
        formatters: {
            /* eslint-disable no-unused-vars */
            level: (label, number) => {
            /* eslint-enable no-unused-vars */
                return { level: label };
            }
        }
    }));

    // Check file rotation every 5 minutes, and rotate the file if its size exceeds max log size in mb, keep only 3 rotated files
    rotator.register(logFilePath, {
        schedule: '5m',
        size: config.logging.max_size + 'm',
        compress: false,
        count: 3
    });
    rotator.on('error', (err) => {
        console.log('Log rotate error:', err);
    });  
    // 'rotate' event is invoked whenever a registered file gets rotated
    rotator.on('rotate', (file) => {
        console.log('Log file rotated:', file);
    });

    loggers[name] = logger;
    return logger;
}