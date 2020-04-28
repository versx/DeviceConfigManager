'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Device = require('./device.js');
const utils = require('../utils.js');

const schedulesFile = path.resolve(__dirname, '../schedules.json');
const scheduleCheckInterval = 60 * 1000;

var lastUpdate = -2;

if (!fs.existsSync(schedulesFile)) {
    fs.writeFileSync(schedulesFile, '{}');
}

class ScheduleManager {
    static getAll() {
        var json = fs.readFileSync(schedulesFile);
        var schedules = JSON.parse(json, null, 2);
        return schedules;
    }
    static create(name, config, uuids, startTime, endTime, timezone, nextConfig, enabled) {
        var schedules = this.getAll();
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
        var result = this.save(schedules);
        return result;
    }
    static getByName(name) {
        var schedules = this.getAll();
        if (schedules) {
            return schedules[name];
        }
        return null;
    }
    static update(oldName, name, config, uuids, startTime, endTime, timezone, nextConfig, enabled) {
        var result = this.delete(oldName);
        if (result) {
            result = this.create(name, config, uuids, startTime, endTime, timezone, nextConfig, enabled);
            return result;
        }
        return false;
    }
    static delete(name) {
        var schedules = this.getAll();
        delete schedules[name];
        var result = this.save(schedules);
        return result;
    }
    static deleteAll() {
        var result = this.save({});
        return result;
    }
    static save(schedules) {
        try {
            var json = JSON.stringify(schedules, null, 2);
            fs.writeFileSync(schedulesFile, json);
            console.log('Schedules list updated');
            return true;
        } catch (e) {
            console.error('save:', e);
        }
        return false;
    }
    static async checkSchedules() {
        var now = todaySeconds();
        if (lastUpdate === -2) {
            utils.snooze(5000);
            lastUpdate = parseInt(now);
            return;
        } else if (lastUpdate > now) {
            lastUpdate = -1;
        }
    
        var schedules = ScheduleManager.getAll();
        var values = Object.values(schedules);
        values.forEach(async function(schedule) {
            var startTimeSeconds = timeToSeconds(schedule.start_time);
            var endTimeSeconds = timeToSeconds(schedule.end_time);
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
        console.log('Running schedule for', schedule, 'to assign config', config);
        var uuids = schedule.uuids.split(',');
        if (uuids) {
            uuids.forEach(async function(uuid) {
                var device = await Device.getByName(uuid);
                // Check if the device config is not already set to the scheduled config to assign.
                if (device.confnig) {
                    if (device.config !== config) {
                        device.config = config;
                        var result = await device.save();
                        if (result) {
                            // Success
                            console.log('Device', uuid, 'assigned config', config, 'successfully');
                        } else {
                            console.error('Failed to assign device', uuid, 'config', config);
                        }
                    }
                }
            });
        }
    }
}

function timeToSeconds(time) {
    if (time) {
        var split = time.split(':');
        if (split.length === 3) {
            var hours = parseInt(split[0]);
            var minutes = parseInt(split[1]);
            var seconds = parseInt(split[2]);
            var timeNew = parseInt(hours * 3600 + minutes * 60 + seconds);
            return timeNew;
        }
    }
    return 0;
}

function todaySeconds() {
    var date = moment();
    var formattedDate = date.format('HH:mm:ss');
    var split = formattedDate.split(':');
    if (split.length >= 3) {
        var hour = parseInt(split[0]) || 0;
        var minute = parseInt(split[1]) || 0;
        var second = parseInt(split[2]) || 0;
        return hour * 3600 + minute * 60 + second;
    } else {
        return 0;
    }
}

setInterval(ScheduleManager.checkSchedules, scheduleCheckInterval);

module.exports = ScheduleManager;