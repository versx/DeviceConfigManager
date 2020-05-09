'use strict';

const request = require('request');

const config = require('../config.json');
const Device = require('../models/device.js');
const utils = require('../utils.js');
const devicesCheckInterval = 5 * 60 * 1000; // Check every 5 minutes
const delta = 15 * 60;
var lastUpdate = -2;

class DeviceMonitor {
    static async checkDevices() {
        //console.log("Checking devices...");
        var now = utils.todaySeconds();
        if (lastUpdate === -2) {
            utils.snooze(5000);
            lastUpdate = parseInt(now);
            return;
        } else if (lastUpdate > now) {
            lastUpdate = -1;
        }
    
        var devices = await Device.getAll();
        devices.forEach(async function(device) {
            const isOffline = device.last_seen > (Math.round((new Date()).getTime() / 1000) - delta) ? 0 : 1;
            if (isOffline) {
                const obj = {
                    type: 'device_offline',
                    data: {
                        uuid: device.uuid,
                        config: device.config,
                        last_seen: device.last_seen
                    }
                };
                var webhooks = config.webhooks;
                for (var i = 0; i < webhooks.length; i++) {
                    var webhook = webhooks[i];
                    request.post(
                        webhook,
                        obj,
                        /* eslint-disable no-unused-vars */
                        function(error, res, body) {
                        /* eslint-enable no-unused-vars */
                            if (error) {
                                console.error(error);
                                return;
                            }
                        }
                    );
                }
            }
        });
    
        utils.snooze(5000);
        lastUpdate = parseInt(now);
    }
}

// Only start the device monitor if there are webhooks in the config
if (config.webhooks.length > 0) {
    setInterval(DeviceMonitor.checkDevices, devicesCheckInterval);
}

module.exports = DeviceMonitor;