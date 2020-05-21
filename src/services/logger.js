'use strict';

const winston = require('winston');
const pino = require('pino');
const path = require('path');
const config = require('../config.json');
const logsDir = path.resolve(__dirname, '../../logs');

const loggers = {};

function getLogger(name) {
    // Logger with name was already created, no need to create another.
    if (loggers[name]) {
        return loggers[name];
    }

    const logFilePath = path.resolve(logsDir, name + '.log');
    const logger = pino(pino.destination({
        dest: logFilePath,
        //minLength: 4096, // Buffer before writing
        sync: false
    }));
    /*
    const options = {
        file: {
            level: 'info',
            filename: logFilePath,
            handleExceptions: true,
            json: true,
            maxsize: config.logging.max_size * 1024 * 1024, // 5MB
            maxFiles: 1,
            colorize: true,
            timestamp: true
        }
    };
    const logger = new winston.createLogger({
        format: winston.format.combine(
            winston.format.timestamp({format: config.logging.format}),
            winston.format.json()
        ),
        transports: [
            new winston.transports.File(options.file)
        ],
        exitOnError: false, // Do not exit on handled exceptions
    });
    */
    loggers[name] = logger;
    return logger;
}

module.exports = getLogger;