import { Dialect, Sequelize } from 'sequelize';

export type AppConfig = {
  host: string;
  port: number;
  auth: {
    admin: {
      username: string;
      password: string;
    };
    accessTokenSecret: string;
    refreshTokenSecret: string;
    bearerTokens: string[];
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
  deviceStat?: Model;
  refreshToken?: Model;
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
  webserverPort: number;
  enabled?: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  config?: ConfigModel | null;
  deviceStats?: DeviceStatModel[];
};

export type DeviceStatModel = {
  uuid: string;
  date: Date;
  restarts: number;
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

export type RefreshTokenModel = {
  userId: number;
  accessToken: string;
  refreshToken: string;

  createdAt?: Date;
  updatedAt?: Date;
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
  enabled?: boolean;
  root?: boolean;

  tokens?: UserTokensModel;

  createdAt?: Date;
  updatedAt?: Date;
};

export type UserTokensModel = {
  userId: number;
  accessToken: string;
  refreshToken: string;

  createdAt?: Date;
  updatedAt?: Date;
};

export type Status = 'ok' | 'error';

export type ColorType = 'text' | 'variable' | 'warn' | 'error' | 'date';

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'none';