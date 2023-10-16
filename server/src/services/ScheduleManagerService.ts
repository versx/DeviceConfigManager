import {
  color,
  DeviceService, ScheduleService,
  getUnix, getUnixTime,
  log, logDebug, logError,
} from '.';
import { DefaultScheduleInterval } from '../consts';
import { ScheduleModel } from '../types';

let lastUpdate = -1;

export const checkSchedules = async () => {
  const now = getUnix();
  if (lastUpdate === -1) {
    lastUpdate = now;
    setTimeout(checkSchedules, DefaultScheduleInterval * 1000);
    return;
  } else if (lastUpdate > now) {
    lastUpdate = -1;
  };

  const schedules = await ScheduleService.getSchedules();
  for (const schedule of schedules) {
    if (!schedule.enabled) {
      continue;
    }

    const startTimeSeconds = getUnixTime(new Date(schedule.startTime));
    const endTimeSeconds = getUnixTime(new Date(schedule.endTime));
    const timeLeft = startTimeSeconds - now;
    if (timeLeft >= 0) {
      log(`[${schedule.name}] Triggering schedule in ${color('variable', timeLeft)} seconds`);
    }

    if (startTimeSeconds === 0 && endTimeSeconds === 0) {
      continue;
    }
    
    const hasStarted = now >= startTimeSeconds && now <= endTimeSeconds && lastUpdate <= startTimeSeconds && timeLeft <= 0;
    const hasFinished = now > startTimeSeconds && now >= endTimeSeconds && lastUpdate <= endTimeSeconds;
    const scheduledConfig = hasStarted
      ? schedule.config
      : hasFinished
        ? schedule.nextConfig
        : null;

    if (!scheduledConfig) {
      continue;
    }

    await triggerSchedule(schedule, scheduledConfig);
  }

  lastUpdate = now;
  setTimeout(checkSchedules, DefaultScheduleInterval * 1000);
};

export const triggerSchedule = async (schedule: ScheduleModel, config: string) => {
  logDebug(`[${schedule.name}] Schedule triggered for config ${color('variable', config)}`);

  if (schedule.uuids?.length === 0) {
    return;
  }

  const uuids = Array.isArray(schedule.uuids) ? schedule.uuids : [schedule.uuids];
  for (const uuid of uuids) {
    const device = await DeviceService.getDevice(uuid);
    // Check if the device config is not already set to the scheduled config to assign.
    if (!device || device?.config === config) {
      continue;
    }

    device.set({ config });
    const result = await device.save();
    if (!result) {
      logError(`[${schedule.name}] [${uuid}] Failed to assign config ${color('variable', config)}`);
      return;
    }

    logDebug(`[${schedule.name}] [${uuid}] Device assigned config ${color('variable', config)} successfully`);
  }
};

export const ScheduleManagerService = {
  checkSchedules,
  triggerSchedule,
};