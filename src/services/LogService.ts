import { http } from "../modules";

const getLogs = async (uuid: string) => {
  try {
    const response = await http()
      .get(`logs?uuid=${uuid}`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

const deleteLogs = async (uuid: string, archive: string) => {
  try {
    const response = await http()
      .delete(`logs?uuid=${uuid}&archive=${archive}`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const LogService = {
  getLogs,
  deleteLogs,
};