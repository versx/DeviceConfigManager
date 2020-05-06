'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Device = require('./device.js');
const utils = require('../utils.js');

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
        const schedules = this.getAll();
        schedules[name] = {
            name: name,
            config: config,
            uuids: uuids,
            start_time: startTime,
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
            result = this.create(name, config, uuids, startTime, endTime, timezone, nextConfig, enabled);
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
            console.log('Schedules list updated');
            return true;
        } catch (e) {
            console.error('save:', e);
        }
        return false;
    }
    static async checkSchedules() {
        const now = todaySeconds();
        if (lastUpdate === -2) {
            utils.snooze(5000);
            lastUpdate = parseInt(now);
            return;
        } else if (lastUpdate > now) {
            lastUpdate = -1;
        }
    
        const schedules = ScheduleManager.getAll();
        const values = Object.values(schedules);
        values.forEach(async schedule => {
            const startTimeSeconds = timeToSeconds(schedule.start_time);
            const endTimeSeconds = timeToSeconds(schedule.end_time);
            console.log('Now:', now, 'Last Update:', lastUpdate, 'Start:', startTimeSeconds, 'End:', endTimeSeconds);
            console.log('Triggering schedule', schedule.name, 'in', startTimeSeconds - now, 'seconds');
            if (schedule.enabled) {
                if (startTimeSeconds !== 0 &&
                    endTimeSeconds !== 0 &&
                    now >= startTimeSeconds &&
                    now <= endTimeSeconds &&
                    lastUpdate < startTimeSeconds) {
                    await ScheduleManager.triggerSchedule(schedule, schedule.config);
                } else if (startTimeSeconds !== 0 &&
                    endTimeSeconds !== 0 &&
                    now < startTimeSeconds &&
                    now > endTimeSeconds && 
                    lastUpdate < endTimeSeconds) {
                    await ScheduleManager.triggerSchedule(schedule, schedule.next_config);
                }
            }
        });
    
        utils.snooze(5000);
        lastUpdate = parseInt(now);
    }
    static async triggerSchedule(schedule, config) {
        console.log('Running schedule for', schedule, 'to assign config', config);
        const uuids = schedule.uuids.split(',');
        if (uuids) {
            uuids.forEach(async uuid => {
                const device = await Device.getByName(uuid);
                // Check if the device config is not already set to the scheduled config to assign.
                if (device.config !== config) {
                    device.config = config;
                    const result = await device.save();
                    if (result) {
                        // Success
                        console.log('Device', uuid, 'assigned config', config, 'successfully');
                    } else {
                        console.error('Failed to assign device', uuid, 'config', config);
                    }
                }
            });
        }
    }
}

const timeToSeconds = time => {
    if (time) {
        const split = time.split(':');
        if (split.length === 3) {
            const hours = parseInt(split[0]);
            const minutes = parseInt(split[1]);
            const seconds = parseInt(split[2]);
            const timeNew = parseInt(hours * 3600 + minutes * 60 + seconds);
            return timeNew;
        }
    }
    return 0;
};

const todaySeconds = () => {
    const date = moment();
    const formattedDate = date.format('HH:mm:ss');
    const split = formattedDate.split(':');
    if (split.length >= 3) {
        const hour = parseInt(split[0]) || 0;
        const minute = parseInt(split[1]) || 0;
        const second = parseInt(split[2]) || 0;
        return hour * 3600 + minute * 60 + second;
    } else {
        return 0;
    }
};

setInterval(ScheduleManager.checkSchedules, scheduleCheckInterval);

module.exports = ScheduleManager;