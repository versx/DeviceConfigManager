import { db } from '../models';

const getLogs = async (): Promise<any[]> => {
  return [];
};

const getLog = async (uuid: string) => {
  return null as any;
};

const createLog = async (payload: any): Promise<any> => {
  return null as any;
};

const deleteLog = async (uuid: string): Promise<boolean> => {
  return true;
};

export const LogService = {
  getLog,
  getLogs,
  createLog,
  deleteLog,
};