'use strict';

const fs = require('fs');
const moment = require('moment-timezone');
const bcrypt = require('bcrypt');
const rounds = 10;
const config = require('../config.json');

const readFile = async (path, encoding = 'utf8') => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data.toString(encoding));
        });
    });
};

const fileExists = async (path) => {
    return new Promise((resolve, reject) => {
        try {
            fs.exists(path, (exists) => {
                resolve(exists);
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const fileLastModifiedTime = async (path) => {
    return new Promise((resolve, reject) => {
        try {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(err);
                }
                resolve(convertTz(stats.mtime));
            });
        } catch (e) {
            return reject(e);
        }
    });
};

const snooze = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const getDateTime = (date) => {
    const momentDate = convertTz(date);//moment(date).tz(config.timezone);
    const formatted = momentDate.format(config.logging.format);
    return formatted;
};

const buildConfig = (provider, backendUrl, dataEndpoints, token, webserverPort, heartbeatMaxTime, minDelayLogout,
    loggingUrl, loggingPort, accountManager, deployEggs, nearbyTracker, autoLogin) => {
    let obj = {};
    switch (provider) {
    case 'GoCheats':
        obj = {
            'backend_url': backendUrl,
            'data_endpoints': (dataEndpoints || '').split(',') || [],
            'backend_secret_token': token,
            'webserver_port': webserverPort || 8080
        };
        break;
    case 'Kevin':
        obj = {
            'backend_url': backendUrl,
            'data_endpoints': (dataEndpoints || '').split(',') || [],
            'backend_secret_token': token,
            'webserver_port': webserverPort || 8080,
            'heartbeat_max_time': heartbeatMaxTime,
            'min_delay_logout': minDelayLogout,
            'account_manager': accountManager,
            'deploy_eggs': deployEggs,
            'nearby_tracker': nearbyTracker,
            'auto_login': autoLogin
        };
        break;
    case 'AI':
        obj = {
            'backend_url': backendUrl,
            'data_endpoints': (dataEndpoints || '').split(',') || [],
            'backend_secret_token': token,
            'webserver_port': webserverPort || 8080,
            'min_delay_logout': minDelayLogout,
            'logging_url': loggingUrl,
            'logging_port': loggingPort,
            'account_manager': accountManager,
            'deploy_eggs': deployEggs,
            'nearby_tracker': nearbyTracker
        };
    }
    const json = JSON.stringify(obj);
    return json;
};

const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return 0;
    }
    const index = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (index == 0) {
        return bytes + ' ' + sizes[index];
    }
    return (bytes / Math.pow(1024, index)).toFixed(1) + ' ' + sizes[index];
};

const timeToSeconds = (time) => {
    if (time) {
        const split = time.split(':');
        if (split.length === 3) {
            const hours = parseInt(split[0]);
            const minutes = parseInt(split[1]);
            const seconds = parseInt(split[2]);
            const timeNew = parseInt(hours * 3600 + minutes * 60 + seconds);
            return timeNew;
        }
    }
    return 0;
};

const todaySeconds = () => {
    const date = moment().tz(config.timezone);
    const formattedDate = date.format('HH:mm:ss');
    const split = formattedDate.split(':');
    if (split.length >= 3) {
        const hour = parseInt(split[0]) || 0;
        const minute = parseInt(split[1]) || 0;
        const second = parseInt(split[2]) || 0;
        return hour * 3600 + minute * 60 + second;
    } else {
        return 0;
    }
};

const convertTz = (date) => {
    const momentDate = moment(date).tz(config.timezone);
    return momentDate;
};

const encrypt = (data) => {
    const encrypted = bcrypt.hashSync(data, rounds);
    return encrypted;
};

const verify = (data, verifyHash) => {
    const result = bcrypt.compareSync(data, verifyHash);
    return result;
};

const generateString = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

module.exports = {
    readFile,
    fileExists,
    fileLastModifiedTime,
    snooze,
    getDateTime,
    buildConfig,
    formatBytes,
    timeToSeconds,
    todaySeconds,
    convertTz,
    encrypt,
    verify,
    generateString
};