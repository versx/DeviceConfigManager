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

function snooze(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDateTime(timestamp) {
    var unixTimestamp = timestamp * 1000;
    var d = new Date(unixTimestamp);
    return d.toLocaleDateString('en-US') + ' ' + d.toLocaleTimeString('en-US'); // TODO: locale
}

function buildConfig(backendUrl, dataEndpoints, token, heartbeatMaxTime, minDelayLogout,
    accountManager, deployEggs, nearbyTracker, autoLogin) {
    // TODO: Check provider against keys needed (or just assume?) and only return those keys.
    var obj = {
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
    var json = JSON.stringify(obj, null, 2);
    return json;
}

function saveDataAsImage(name, imgData) {
    var data = imgData.replace(/^data:image\/\w+;base64,/, '');
    var buf = new Buffer(data, 'base64');
    fs.writeFileSync('../screenshots/' + name, buf);
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
    saveDataAsImage,
    formatBytes
};