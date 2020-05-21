'use strict';

const request = require('request');

const logger = require('./logger.js');
const config = require('../config.json');
const Device = require('../models/device.js');
const utils = require('../utils.js');
const devicesCheckInterval = (config.monitor.interval || 5) * 60 * 1000; // Check every 5 minutes
const delta = 15 * 60;
let lastUpdate = -2;

class DeviceMonitor {
    static async checkDevices() {
        const now = utils.todaySeconds();
        if (lastUpdate === -2) {
            utils.snooze(5000);
            lastUpdate = parseInt(now);
            return;
        } else if (lastUpdate > now) {
            lastUpdate = -1;
        }
    
        const devices = await Device.getAll();
        devices.forEach(async function(device) {
            const isOffline = device.last_seen > (Math.round((new Date()).getTime() / 1000) - delta) ? 0 : 1;
            if (isOffline) {
                // If restart for device monitor is enabled, automatically send restart device command if offline.
                if (config.monitor.restart) {
                    var listeners = config.listeners;
                    for (let i = 0; i < listeners.length; i++) {
                        const url = listeners[i];
                        const options = {
                            url: url,
                            json: true,
                            method: 'POST',
                            body: JSON.stringify({ 'type': 'restart', 'device': device.uuid }),
                            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                        };
                        logger('dcm').info(`Sending reboot request to remote listener at ${url}`);
                        /* eslint-disable no-unused-vars */
                        request(options, (err, res, body) => {
                        /* eslint-enable no-unused-vars */
                            if (err) {
                                logger('dcm').error(`Failed to send restart command to remote listener ${url}. Error: ${err}`);
                            }
                            logger('dcm').info(`Sent restart command to remote listener ${url}`);
                        });
                    }
                }

                const obj = {
                    type: 'device_offline',
                    data: {
                        uuid: device.uuid,
                        config: device.config,
                        last_seen: device.last_seen
                    }
                };
                const webhooks = config.monitor.webhooks;
                for (let i = 0; i < webhooks.length; i++) {
                    const webhook = webhooks[i];
                    request.post(
                        webhook,
                        obj,
                        /* eslint-disable no-unused-vars */
                        function(error, res, body) {
                        /* eslint-enable no-unused-vars */
                            if (error) {
                                logger('dcm').error(error);
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
if (config.monitor.webhooks.length > 0) {
    setInterval(DeviceMonitor.checkDevices, devicesCheckInterval);
}

module.exports = DeviceMonitor;