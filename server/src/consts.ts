import { resolve } from 'path';

// Device API routes
export const BaseDeviceApiRoute = '/api/';
export const ConfigApiRoute = BaseDeviceApiRoute + 'config';
export const LogNewApiRoute = BaseDeviceApiRoute + 'log/new';

// API routes
export const BaseApiRoute = '/api/v2/';
export const AuthApiRoute = BaseApiRoute + 'auth';
export const ConfigsApiRoute = BaseApiRoute + 'configs';
export const DevicesApiRoute = BaseApiRoute + 'devices';
export const LogsApiRoute = BaseApiRoute + 'logs';
export const SchedulesApiRoute = BaseApiRoute + 'schedules';
export const SettingsApiRoute = BaseApiRoute + 'settings';
export const UsersApiRoute = BaseApiRoute + 'users';

export const DefaultExpiresIn = 365 * 86400; // 1 year
export const DefaultMaxSlugLimit = 1000;
export const DefaultScheduleInterval = 60; // seconds
export const DefaultWebServerPort = 8080;

export const LogsFolder = resolve(__dirname, '../../server/static/logs');
export const DefaultLogsRotateInterval = '30m'; // check if needs to rotate every 30 minutes
export const DefaultLogsRotateMaxFiles = 5; // keep up to 10 back copies
export const DefaultLogsRotateMaxSize = '1M'; // rotate every 1 MBs written

// Database table options
export const SequelizeOptions = {
  createdAt: true,
  updatedAt: true,
  underscored: true,
  timestamps: true,
};

// Database column attributes
export const UserAttributes = [
  'id',
  'username',
  'password',
  'enabled',
  'root',
  'createdAt',
  'updatedAt',
];

export const DefaultUserPasswordIterations = 8;