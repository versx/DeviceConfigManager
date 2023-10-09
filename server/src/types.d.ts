import { Dialect, Sequelize } from 'sequelize';

export type AppConfig = {
  host: string;
  port: number;
  auth: {
    admin: {
      username: string;
      password: string;
    };
    secret: string;
  };
  database: {
    dialect: Dialect;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    timezone: string;
  };
  logs: {
    level: LogLevel;
    colors: {
      [type: ColorType]: string;
    };
    rotate: {
      interval: string;
      maxFiles: number;
      maxSize: string;
    };
  };
  timezone: string;
  autoSyncIP: boolean;
};

export type SequelizeDatabaseConnection = {
  connection: Sequelize;
  config?: Model;
  device?: Model;
  schedule?: Model;
  setting?: Model;
  user?: Model;
};

export type ConfigModel = {
  name: string;
  provider: string;
  backendUrl: string;
  dataEndpoints: string[];
  bearerToken: string | null;
  default: boolean;
  enabled: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};

export type DeviceModel = {
  uuid: string;
  config?: string | null;
  model?: string | null;
  ipAddr?: string | null;
  iosVersion?: string | null;
  ipaVersion?: string | null;
  notes?: string | null;
  lastSeen?: Date | null;
  enabled?: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  config?: ConfigModel | null;
};

export type LogModel = {
  uuid: string;
  message: string;
  logLevel: string;
  date: Date;
};

export type LogArchiveModel = {
  path: string;
  fileName: string;
  data: string;
  date: Date;
  compressed: boolean;
  size: number;
};

export type ScheduleModel = {
  name: string;
  config: string;
  uuids: string[];
  startTime: Date;
  endTime: Date;
  timezoneOffset: number;
  nextConfig: string;
  enabled: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};

export type SettingModel = {
  name: string;
  value: string | number | boolean | any;

  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type UserModel = {
  id?: number;
  username: string;
  password: string;
  apiKey?: string;
  enabled?: boolean;
  root?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};

export type Status = 'ok' | 'error';

export type ColorType = 'text' | 'variable' | 'warn' | 'error' | 'date';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none';