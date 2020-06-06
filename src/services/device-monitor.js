'use strict';

const request = require('request');

const logger = require('./logger.js');
const config = require('../config.json');
const Device = require('../models/device.js');
const utils = require('./utils.js');
const devicesCheckInterval = (config.monitor.interval || 5) * 60 * 1000; // Check every 5 minutes
const delta = (config.monitor.threshold || 15) * 60; // Amount of time in seconds before rendered offline
const maxRebootCount = 10;
const devicesRebooted = {};

const start = () => {
    // Only start the device monitor if it's enabled in the config
    if (config.monitor.enabled) {
        logger('dcm').info(`Enabling device monitor every ${devicesCheckInterval / 1000} seconds`);
        setInterval(checkDevices, devicesCheckInterval);
    }
};

const checkDevices = async () => {
    const devices = await Device.getAll();
    if (!(devices && devices.length > 0)) {
        return;
    }

    for (let i = 0; i < devices.length; i++) {
        const device = devices[i];
        const isOffline = device.last_seen > (Math.round(utils.convertTz(new Date()).format('x') / 1000) - delta) ? 0 : 1;
        if (!isOffline || !device.enabled) {
            continue;
        }

        // If restart for device monitor is enabled, automatically send restart device command if offline.
        if (config.monitor.reboot && config.listeners.length > 0) {
            const listeners = config.listeners;
            for (let i = 0; i < listeners.length; i++) {
                if (devicesRebooted[device.uuid]) {
                    if (devicesRebooted[device.uuid] > maxRebootCount) {
                        // Skip rebooting devices we've already rebooted passed the maximum count
                        continue;
                    }
                }
                const url = listeners[i];
                const options = {
                    url: url,
                    json: true,
                    method: 'POST',
                    body: { 'type': 'restart', 'device': device.uuid },
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                };
                logger('dcm').info(`Sending reboot request for ${device.uuid} to remote listener at ${url}`);
                /* eslint-disable no-unused-vars */
                request(options, (err, res, body) => {
                /* eslint-enable no-unused-vars */
                    if (err) {
                        logger('dcm').error(`Failed to send restart command to remote listener ${url}. Error: ${err}`);
                    }
                    logger('dcm').info(`Sent restart command for ${device.uuid} to remote listener ${url}`);
                });
                if (devicesRebooted[device.uuid]) {
                    devicesRebooted[device.uuid]++;
                } else {
                    devicesRebooted[device.uuid] = 1;
                }
            }
        }

        if (config.monitor.webhooks.length === 0) {
            return;
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
                (error, res, body) => {
                /* eslint-enable no-unused-vars */
                    if (error) {
                        logger('dcm').error(error);
                        return;
                    }
                }
            );
        }
    }

    await utils.snooze(5000);
};

module.exports = { start };
