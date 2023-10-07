// API routes
export const BaseApiRoute = '/api/';
export const AuthApiRoute = BaseApiRoute + 'auth';
export const ConfigApiRoute = BaseApiRoute + 'config';
export const ConfigsApiRoute = BaseApiRoute + 'configs';
export const DevicesApiRoute = BaseApiRoute + 'devices';
export const LogsApiRoute = BaseApiRoute + 'logs';
export const SchedulesApiRoute = BaseApiRoute + 'schedules';
export const SettingsApiRoute = BaseApiRoute + 'settings';
export const UsersApiRoute = BaseApiRoute + 'users';

export const DefaultExpiresIn = 365 * 86400; // 1 year

export const DefaultMaxSlugLimit = 1000;

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
  'apiKey',
  'enabled',
  'root',
  'createdAt',
  'updatedAt',
];

export const DefaultUserPasswordIterations = 8;

export const SettingKeys = {
  EnableRegistration: 'enable_registration',
  EnableTelemetry: 'enable_telemetry',
  MaxSlugLimit: 'max_slug_limit',
};