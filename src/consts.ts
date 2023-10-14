export const Title = 'Device Config Manager';
export const DrawerWidth = 240;

export const ActiveMenuItemColor = '#0088fe'; //'#1e90ff';

export const DefaultWebServerPort = 8080;

export const DefaultLogsReloadInterval = 5; // seconds

export const DefaultEnableRegistration = true;
export const DefaultUserTheme = 'system';

export const Base64ImageHeader = 'data:image/png;base64,';

export const DeviceOnlineIcon = 'https://raw.githubusercontent.com/versx/DeviceConfigManager/master/static/img/online.png';
export const DeviceOfflineIcon = 'https://raw.githubusercontent.com/versx/DeviceConfigManager/master/static/img/offline.png';

export const Never = 'Never';
export const NotAssigned = 'Not Assigned';
export const UnknownModel = 'Unknown Model';

export const StorageKeys = {
  AdminOpen: 'adminOpen',
  ColorMode: 'colorMode',
  DeviceDisplay: 'deviceDisplay',
  IsAuthenticated: 'isAuthenticated',
  ServerSettings: 'serverSettings',
  SettingsETag: 'settingsETag',
  User: 'user',
};

export const SettingKeys = {
  AgentUrls: 'agent_urls',
  EnableRegistration: 'enable_registration',
  EnableAutoSyncIP: 'enable_auto_sync_ip',
};

export const Routes = {
  dashboard: '/',
  configs: '/configs',
  devices: '/devices',
  device: '/devices/:uuid',
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