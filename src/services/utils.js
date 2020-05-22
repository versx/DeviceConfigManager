'use strict';

const fs = require('fs');
const moment = require('moment');
const config = require('../config.json');

export const readFile = async (path) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                return reject(err);
            }
            resolve(data.toString('utf8'));
        });
    });
}

export const fileExists = async (path) => {
    return new Promise((resolve, reject) => {
        try {
            fs.exists(path, (exists) => {
                resolve(exists);
            });
        } catch (e) {
            return reject(e);
        }
    });
}

export const fileLastModifiedTime = async (path) => {
    return new Promise((resolve, reject) => {
        try {
            fs.stat(path, (err, stats) => {
                if (err) {
                    return reject(err);
                }
                resolve(stats.mtime);
            });
        } catch (e) {
            return reject(e);
        }
    });
}

export const snooze = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const getDateTime = (date) => {
    const momentDate = moment(date);
    const formatted = momentDate.format(config.logging.format);
    return formatted;
}

export const buildConfig = (provider, backendUrl, dataEndpoints, token, heartbeatMaxTime, minDelayLogout,
    loggingUrl, loggingPort, accountManager, deployEggs, nearbyTracker, autoLogin) => {
    let obj = {};
    switch (provider) {
    case 'GoCheats':
        obj = {
            'backend_url': backendUrl,
            'data_endpoints': (dataEndpoints || '').split(',') || [],
            'backend_secret_token': token
        };
        break;
    case 'Kevin':
        obj = {
            'backend_url': backendUrl,
            'data_endpoints': (dataEndpoints || '').split(',') || [],
            'backend_secret_token': token,
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
}

export const formatBytes = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return 0;
    }
    const index = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    if (index == 0) {
        return bytes + ' ' + sizes[index];
    }
    return (bytes / Math.pow(1024, index)).toFixed(1) + ' ' + sizes[index];
}

export const timeToSeconds = (time) => {
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
}

export const todaySeconds = () => {
    const date = moment();
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
}