'use strict';

const fs = require('fs');
const path = require('path');
const moment = require('moment');

const utils = require('../utils.js');

const schedulesFile = path.resolve(__dirname, '../schedules.json');
const scheduleCheckInterval = 60 * 1000;

var lastUpdate = -2;

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
            console.log("Schedules list updated");
            return true;
        } catch (e) {
            console.error("save:", e);
        }
        return false;
    }
    static checkSchedules() {
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
        values.forEach(function(schedule) {
            var startTimeSeconds = timeToSeconds(schedule.start_time);
            var endTimeSeconds = timeToSeconds(schedule.end_time);
            console.log("Now:", now, "Last Update:", lastUpdate, "Start:", startTimeSeconds, "End:", endTimeSeconds);
            console.log("Triggering schedule", schedule.name, "in", startTimeSeconds - now, "seconds");
            if (schedule.enabled) {
                if (startTimeSeconds != 0 &&
                    now >= startTimeSeconds &&
                    now <= endTimeSeconds &&
                    lastUpdate < startTimeSeconds) {
                    ScheduleManager.triggerSchedule(schedule);
                } else if (endTimeSeconds != 0 &&
                    now < startTimeSeconds &&
                    now > endTimeSeconds && 
                    lastUpdate < endTimeSeconds) {
                    ScheduleManager.onScheduleComplete(schedule);
                }
            }
        });
    
        utils.snooze(5000);
        lastUpdate = parseInt(now);
    }
    static triggerSchedule(schedule) {
        console.log("Running schedule for", schedule);
        var uuids = schedule.uuids.split(',');
        if (uuids) {
            uuids.forEach(function(uuid) {
                var device = Device.getByName(uuid);
                if (device.config !== schedule.config) {
                    device.config = schedule.config;
                    var result = device.save();
                    if (result) {
                        // Success
                        console.log("Device", uuid, "assigned config", device.config, "successfully");
                    } else {
                        console.error("Failed to assign device", uuid, "config", schedule.config);
                    }
                }
            });
        }
    }
    static onScheduleComplete(schedule) {
        console.log("On schedule complete for", schedule);
        var uuids = schedule.uuids.split(',');
        if (uuids) {
            uuids.forEach(function(uuid) {
                var device = Device.getByName(uuid);
                if (device.config !== schedule.next_config) {
                    device.config = schedule.next_config;
                    var result = device.save();
                    if (result) {
                        // Success
                        console.log("Device", uuid, "assigned config", device.config, "successfully");
                    } else {
                        console.error("Failed to assign device", uuid, "config", schedule.next_config);
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

function secondsToTime(value) {
    return `${value / 3600}:${(value % 3600) / 60}:${(value % 3600) % 60}`;
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