'use strict';

const request = require('request');

const logger = require('./logger.js');
const config = require('../config.json');
const Device = require('../models/device.js');
const { DiscordMessage, DiscordEmbed, DiscordColors } = require('../models/discord.js');
const utils = require('./utils.js');
const devicesCheckInterval = (config.monitor.interval || 5) * 60 * 1000; // Check every 5 minutes
const delta = (config.monitor.threshold || 15) * 60; // Amount of time in seconds before rendered offline
const maxRebootCount = config.monitor.maxRebootCount || 10;
const devicesRebooted = {};
const deviceWebhooksSent = {};

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
        if (!isOffline || !device.enabled || device.exclude_reboots) {
            continue;
        }

        // If restart for device monitor is enabled, automatically send restart device command if offline.
        if (config.monitor.reboot && config.listeners.length > 0) {
            const listeners = config.listeners;
            for (let i = 0; i < listeners.length; i++) {
                if (devicesRebooted[device.uuid] && devicesRebooted[device.uuid] > maxRebootCount) {
                    // Skip rebooting devices we've already rebooted passed the maximum count
                    continue;
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
                        logger('dcm').error(`Failed to send restart command to remote listener ${url}`);
                    } else {
                        logger('dcm').info(`Sent restart command for ${device.uuid} to remote listener ${url}`);
                    }
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

        sendOfflineMessage(device);
    }

    await utils.snooze(5000);
};

const sendOfflineMessage = (device) => {
    const webhooks = config.monitor.webhooks;
    const payload = createPayload(device);
    for (let i = 0; i < webhooks.length; i++) {
        const webhook = webhooks[i];
        sendWebhook(webhook, payload);
    }
    deviceWebhooksSent[device.uuid] = new Date();
};

const sendWebhook = (url, payload) => {
    utils.postRequest(url, payload);
};

const createPayload = (device) => {
    const time = delta / 60;
    const date = utils.convertTz(new Date()).format(config.logging.format);
    const message = `[${date}] Device **${device.uuid}** has not requested config **${device.config}** in over **${time}** minutes`;
    const embed = DiscordEmbed.createAdvancedEmbed(null, message, null, null, DiscordColors.Red);
    const discordMessage = new DiscordMessage(null, config.title || 'DeviceConfigManager', null, [embed]);
    return discordMessage;
};

module.exports = { start, sendOfflineMessage };
