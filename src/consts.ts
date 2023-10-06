export const Title = 'Device Config Manager';
export const DrawerWidth = 240;

export const ActiveMenuItemColor = '#0088fe'; //'#1e90ff';

export const DefaultEnableRegistration = true;
export const DefaultUserTheme = 'system';

export const StorageKeys = {
  AdminOpen: 'adminOpen',
  ColorMode: 'colorMode',
  IsAuthenticated: 'isAuthenticated',
  ServerSettings: 'serverSettings',
  SettingsETag: 'settingsETag',
  User: 'user',
};

export const SettingKeys = {
  EnableRegistration: 'enable_registration',
};

export const Routes = {
  dashboard: '/',
  configs: '/configs',
  devices: '/devices',
  schedules: '/schedules',
  logs: '/logs',
  settings: '/settings',
  login: '/login',
  register: '/register',
  admin: {
    dashboard: '/admin',
    users: '/admin/users',
    settings: '/admin/settings',
  },
};