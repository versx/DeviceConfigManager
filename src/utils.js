'use strict';

const fs = require('fs');

async function readFile(path) {
    return new Promise(function(resolve, reject) {
        fs.readFile(path, function(err, data) {
            if (err) {
                return reject(err);
            }
            resolve(data.toString('utf8'));
        });
    });
}

async function fileExists(path) {
    return new Promise(function(resolve, reject) {
        try {
            fs.exists(path, function(exists) {
                resolve(exists);
            });
        } catch (e) {
            return reject(e);
        }
    });
}

async function fileSize(path) {
    return new Promise(function(resolve, reject) {
        try {
            fs.stat(path, function(err, stats) {
                if (err) {
                    return reject(err);
                }
                resolve(stats.size);
            });
        } catch (e) {
            return reject(e);
        }
    });
}

function snooze(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDateTime(timestamp) {
    var unixTimestamp = timestamp * 1000;
    var d = new Date(unixTimestamp);
    return d.toLocaleDateString('en-US') + ' ' + d.toLocaleTimeString('en-US'); // TODO: locale
}

function buildConfig(provider, backendUrl, dataEndpoints, token, heartbeatMaxTime, minDelayLogout,
    accountManager, deployEggs, nearbyTracker, autoLogin) {
    var obj = {};
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
    }
    var json = JSON.stringify(obj, null, 2);
    return json;
}

function formatBytes(bytes) {
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

module.exports = {
    readFile,
    fileExists,
    fileSize,
    snooze,
    getDateTime,
    buildConfig,
    formatBytes
};