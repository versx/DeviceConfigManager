import { db } from '../models';
import { ScheduleModel } from '../types';

const getSchedules = async (): Promise<any[]> => {
  const models = await db.schedule.findAll();
  return models;
};

const getSchedule = async (name: string) => {
  const model = await db.schedule.findByPk(name);
  return model;
};

const createSchedule = async (payload: ScheduleModel): Promise<ScheduleModel> => {
  const { name } = payload;
  const model = await getSchedule(name);
  if (model) {
    // Schedule already exists, return model
    return model;
  }

  const result = await db.schedule.create(payload);
  return result;
};

const updateSchedule = async (name: string, payload: ScheduleModel): Promise<ScheduleModel | false> => {
  const model = await getSchedule(name);
  if (!model) {
    return false;
  }

  model.set({ ...payload });
  await model.save();
  return model;
};

const deleteSchedule = async (name: string): Promise<boolean> => {
  const model = await getSchedule(name);
  model?.destroy();
  return true;
};

export const ScheduleService = {
  getSchedule,
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule
};