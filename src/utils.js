'use strict';

const fs = require('fs');

function readFile(path) {
    var data = fs.readFileSync(path);
    return data.toString('utf8');
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
    var data = imgData.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    fs.writeFileSync('../screenshots/' + name, buf);
}

module.exports = {
    readFile,
    snooze,
    getDateTime,
    buildConfig,
    saveDataAsImage
};