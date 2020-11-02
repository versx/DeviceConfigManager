'use strict';

const fs = require('fs');
const path = require('path');

const Device = require('./device.js');
const logger = require('../services/logger.js');
const utils = require('../services/utils.js');

const schedulesFile = path.resolve(__dirname, '../schedules.json');
const scheduleCheckInterval = 60 * 1000;

let lastUpdate = -2;

if (!fs.existsSync(schedulesFile)) {
    fs.writeFileSync(schedulesFile, '{}');
}

class ScheduleManager {
    static getAll() {
        const json = fs.readFileSync(schedulesFile);
        const schedules = JSON.parse(json, null, 2);
        return schedules;
    }
    static create(name, config, uuids, startTime, endTime, timezone, nextConfig, enabled) {
        let schedules = this.getAll();
        schedules[name] = {
            name: name,
            config: config,
            uuids: Array.isArray(uuids) ? uuids : uuids.split(','),
            start_time: startTime === '00:00:00' ? '00:00:01' : startTime,
            end_time: endTime,
            timezone: parseInt(timezone),
            next_config: nextConfig,
            enabled: enabled
        };
        const result = this.save(schedules);
        return result;
    }
    static getByName(name) {
        const schedules = this.getAll();
        if (schedules) {
            return schedules[name];
        }
        return null;
    }
    static update(oldName, name, config, uuids, startTime, endTime, timezone, nextConfig, enabled) {
        let result = this.delete(oldName);
        if (result) {
            const start = startTime === '00:00:00' ? '00:00:01' : startTime;
            result = this.create(name, config, uuids, start, endTime, timezone, nextConfig, enabled);
            return result;
        }
        return false;
    }
    static delete(name) {
        const schedules = this.getAll();
        delete schedules[name];
        const result = this.save(schedules);
        return result;
    }
    static deleteAll() {
        const result = this.save({});
        return result;
    }
    static save(schedules) {
        try {
            const json = JSON.stringify(schedules, null, 2);
            fs.writeFileSync(schedulesFile, json);
            logger('dcm').info('Schedules list updated');
            return true;
        } catch (e) {
            logger('dcm').error(`save: ${e}`);
        }
        return false;
    }
    static async checkSchedules() {
        const now = utils.todaySeconds();
        if (lastUpdate === -2) {
            utils.snooze(5000);
            lastUpdate = parseInt(now);
            return;
        } else if (lastUpdate > now) {
            lastUpdate = -1;
        }
    
        const schedules = ScheduleManager.getAll();
        const values = Object.values(schedules);
        values.forEach(async (schedule) => {
            const startTimeSeconds = utils.timeToSeconds(schedule.start_time);
            const endTimeSeconds = utils.timeToSeconds(schedule.end_time);
            logger('dcm').info(`Now: ${now} Last Update: ${lastUpdate} Start: ${startTimeSeconds} End: ${endTimeSeconds}`);
            logger('dcm').info(`Triggering schedule ${schedule.name} in ${startTimeSeconds - now} seconds`);
            if (schedule.enabled) {
                if (startTimeSeconds !== 0 &&
                    endTimeSeconds !== 0 &&
                    now >= startTimeSeconds &&
                    now <= endTimeSeconds &&
                    lastUpdate < startTimeSeconds) {
                    await ScheduleManager.triggerSchedule(schedule, schedule.config);
                } else if (startTimeSeconds !== 0 &&
                    endTimeSeconds !== 0 &&
                    !(now > startTimeSeconds && now < endTimeSeconds) && 
                    lastUpdate > endTimeSeconds) {
                    await ScheduleManager.triggerSchedule(schedule, schedule.next_config);
                }
            }
        });
    
        utils.snooze(5000);
        lastUpdate = parseInt(now);
    }
    static async triggerSchedule(schedule, config) {
        logger('dcm').info(`Running schedule for ${schedule} to assign config ${config}`);
        if (schedule.uuids) {
            const uuids = Array.isArray(schedule.uuids) ? schedule.uuids : [schedule.uuids];
            uuids.forEach(async (uuid) => {
                const device = await Device.getByName(uuid);
                // Check if the device config is not already set to the scheduled config to assign.
                if (device && device.config !== config) {
                    device.config = config;
                    const result = await device.save();
                    if (result) {
                        // Success
                        logger('dcm').info(`Device ${uuid} assigned config ${config} successfully`);
                    } else {
                        logger('dcm').error(`Failed to assign device ${uuid} config ${config}`);
                    }
                }
            });
        }
    }
}

setInterval(ScheduleManager.checkSchedules, scheduleCheckInterval);

module.exports = ScheduleManager;
