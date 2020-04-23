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

function buildConfig(backendUrl, port, heartbeatMaxTime, pokemonMaxTime, raidMaxTime, startupLat, startupLon, token, jitterValue,
    maxWarningTimeRaid, encounterDelay, minDelayLogout, maxEmptyGmo, maxFailedCount, maxNoQuestCount, loggingUrl,
    loggingPort, loggingTls, loggingTcp, accountManager, deployEggs, nearbyTracker, autoLogin, ultraIV, ultraQuests) {
    var obj = {
        'backendURL': backendUrl,
        'port': port,
        'heartbeatMaxTime': heartbeatMaxTime,
        'pokemonMaxTime': pokemonMaxTime,
        'raidMaxTime': raidMaxTime,
        'startupLat': startupLat,
        'startupLon': startupLon,
        'token': token,
        'jitterValue': jitterValue,//5.0e-05,
        'maxWarningTimeRaid': maxWarningTimeRaid,
        'encounterDelay': encounterDelay,
        'minDelayLogout': minDelayLogout,
        'maxEmptyGMO': maxEmptyGmo,
        'maxFailedCount': maxFailedCount,
        'maxNoQuestCount': maxNoQuestCount,
        'loggingURL': loggingUrl,
        'loggingPort': loggingPort,
        'loggingTLS': loggingTls,
        'loggingTCP': loggingTcp,
        'accountManager': accountManager,
        'deployEggs': deployEggs,
        'nearbyTracker': nearbyTracker,
        'autoLogin': autoLogin,
        'ultraIV': ultraIV,
        'ultraQuests': ultraQuests
    };
    var json = JSON.stringify(obj, null, 2);
    return json;
}

module.exports = {
    readFile,
    snooze,
    getDateTime,
    buildConfig
};