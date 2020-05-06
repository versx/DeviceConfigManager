'use strict';

const fs = require('fs');

const readFile = path => {
    const data = fs.readFileSync(path);
    return data.toString('utf8');
}

const snooze = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getDateTime = timestamp => {
    const unixTimestamp = timestamp * 1000;
    const d = new Date(unixTimestamp);
    return d.toLocaleDateString('en-US') + ' ' + d.toLocaleTimeString('en-US'); // TODO: locale
}

const buildConfig = (backendUrl, dataEndpoints, token, heartbeatMaxTime, minDelayLogout,
    accountManager, deployEggs, nearbyTracker, autoLogin) => {
    const obj = {
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
    const json = JSON.stringify(obj, null, 2);
    return json;
}

module.exports = {
    readFile,
    snooze,
    getDateTime,
    buildConfig
};