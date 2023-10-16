import { http } from '../modules';
import { Schedule } from '../types';

const getSchedules = async () => {
  try {
    const response = await http()
      .get('schedules');
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const createSchedule = async (payload: Schedule) => {
  try {
    const response = await http()
      .post(`schedules`, { schedule: payload });
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const updateSchedule = async (name: string, payload: Schedule) => {
  try {
    const response = await http()
      .put(`schedules?name=${name}`, { schedule: payload });
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const deleteSchedule = async (name: string) => {
  try {
    const response = await http()
      .delete(`schedules?name=${name}`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const ScheduleService = {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};