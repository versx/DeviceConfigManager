export type Config = {
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

export type Device = {
  uuid: string;
  config: string | null;
  model: string | null;
  ipAddr: string | null;
  iosVersion: string | null;
  ipaVersion: string | null;
  notes?: string | null;
  lastSeen: Date | null;
  enabled: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  config?: ConfigModel | null;
};

export type Schedule = {
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

export type Setting = {
  name: string;
  value: string | number | boolean | any;

  createdAt?: Date | null;
  updatedAt?: Date | null;
};

export type User = {
  id?: number;
  username: string;
  password: string;
  apiKey?: string;
  enabled?: boolean;
  root?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
};

export interface ServerSettings extends Record<string, any> {
};

export type ThemeColorMode = 'light' | 'dark' | 'system';