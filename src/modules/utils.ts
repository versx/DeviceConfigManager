import { DateTime } from 'luxon';

import { Order } from '../components';
import { Setting } from '../types';

export const substr = (text: string, maxChars: number = 30, addEllipsis: boolean = true) => {
  if (text.length <= maxChars) {
    return text;
  }
  const result = text.substring(0, Math.min(text.length, maxChars));
  return addEllipsis ? result + '...' : result;
};

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export function getComparator<T, Key extends keyof T>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]?: any[] | boolean | number | string | Date | null },
  b: { [key in Key]?: any[] | boolean | number | string | Date | null },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
export function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

export const getUnix = () => getUnixTime(new Date());
export const getUnixTime = (date: Date) => Math.round(date.getTime() / 1000);

export const formatDateForDateTimeInput = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0!
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

export const isDeviceOnline = (lastSeen: Date | string | null, threshold: number = 15) => {
  if (!lastSeen) {
    return false;
  }
  const tsNow = getUnix();
  const tsLastSeen = Math.round(new Date(lastSeen).getTime() / 1000);
  const diff = tsNow - tsLastSeen;
  return diff <= threshold * 60;
};

export const getTimezoneName = (offset: number): string => {
  const timezone = `Etc/GMT${offset >= 0 ? '+' : '-'}${Math.abs(offset)}`;
  const dateTime = DateTime.now().setZone(timezone);
  return dateTime.zoneName!;
};

export const aggregateData = <T>(data: T[], key: keyof T) => data.reduce((acc: any, item: any) => {
  const property = item[key];
  if (acc[property]) {
    acc[property]++;
  } else {
    acc[property] = 1;
  }
  return removeNullItems(acc);
}, {} as Record<string, number>);

export const removeNullItems = (data: any) => {
  const result: any = {};
  for (const item in data) {
    if (item && item !== 'null') {
      result[item] = data[item];
    }
  }
  return result;
};

interface UserAgentResult {
  platform: UserAgentPlatform;
  browser: UserAgentBrowser;
  engine: UserAgentBrowserEngine;
};

interface UserAgentPlatform {
  name: string;
  win: boolean;
  mac: boolean;
  android: boolean;
  linux: boolean;
  iphone: boolean;
  ipad: boolean;
  unknown: boolean;
};

interface UserAgentBrowser {
  name: string;
  version: string | number;
  msie: boolean;
  firefox: boolean;
  edge: boolean;
  android: boolean;
  chrome: boolean;
  safari: boolean;
  opera: boolean;
  unknown: boolean;
};

interface UserAgentBrowserEngine {
  name: string;
  version?: string | number;
  trident?: boolean;
  webkit?: boolean;
  gecko?: boolean;
  presto?: boolean;
  unknown?: boolean;
};

export const parseUserAgent = (userAgent: string): UserAgentResult => {
  // Based on fantastic jQuery useragent parser plugin https://gist.github.com/373298
  const defaultValue = 'Unknown';
  const agent: UserAgentResult = {
    platform: {
      name: defaultValue,
      win: false,
      mac: false,
      android: false,
      linux: false,
      iphone: false,
      ipad: false,
      unknown: false,
    },
    browser: {
      name: defaultValue,
      version: defaultValue,
      msie: false,
      firefox: false,
      edge: false,
      android: false,
      chrome: false,
      safari: false,
      opera: false,
      unknown: false,
    },
    engine: {
      name: defaultValue,
      version: defaultValue,
      trident: false,
      webkit: false,
      gecko: false,
      presto: false,
      unknown: false,
    },
  };

  let ua = userAgent,
    p = agent.platform,
    b = agent.browser,
    e = agent.engine;

  // Detect platform
  if (/Windows/.test(ua)) {
    p.name = 'Windows';
    p.win = true;
  } else if (/Mac/.test(ua)) {
    p.name = 'macOS';
    p.mac = true;
  } else if (/Android/.test(ua)) {
    p.name = 'Android';
    p.android = true;
  } else if (/Linux/.test(ua)) {
    p.name = 'Linux';
    p.linux = true;
  } else if (/iPhone|iPod/.test(ua)) {
    p.name = 'iPhone';
    p.iphone = true;
  } else if (/iPad/.test(ua)) {
    p.name = 'iPad';
    p.ipad = true;
  } else {
    p.name = 'Other';
    p.unknown = true;
  }

  // Detect browser
  if (/MSIE/.test(ua)) {
    b.name = 'Internet Explorer';
    b.msie = true;
  //} else if (/Firefox/.test(ua)) {
  } else if (/Firefox|FxiOS/.test(ua)) {
    b.name = 'Mozilla Firefox';
    b.firefox = true;
  //} else if (/Edg/.test(ua)) {
  } else if (/Edge|Edga|Edgios|Edg/.test(ua)) {
    b.name = 'Microsoft Edge';
    b.edge = true;
  //} else if (/Chrome/.test(ua)) { // must be tested before Safari
  } else if (/Chrome|CriOS/.test(ua)) { // must be tested before Safari
    b.name = 'Google Chrome';
    b.chrome = true;
  } else if (/Safari/.test(ua)) {
    b.name = 'Apple Safari';
    b.safari = true;
  } else if (/Opera|OPR/.test(ua)) {
    b.name = 'Opera';
    b.opera = true;
  } else {
    b.name = 'Other';
    b.unknown = true;
  }

  // Detect browser version
  if (b.msie) {
    b.version = /MSIE (\d+(\.\d+)*)/.exec(ua)![1];
  } else if (b.firefox) {
    b.version = /Firefox\/(\d+(\.\d+)*)/.exec(ua)![1];
  } else if (b.edge) {
    b.version = /Edg\/(\d+(\.\d+)*)/.exec(ua)![1];
  } else if (b.android) {
    b.version = /V/.exec(ua)![1];
  } else if (b.chrome) {
    b.version = /Chrome\/(\d+(\.\d+)*)/.exec(ua)![1];
  } else if (b.safari) {
    b.version = /Version\/(\d+(\.\d+)*)/.exec(ua)![1];
  } else if (b.opera) {
    b.version = /Version\/(\d+(\.\d+)*)/.exec(ua)![1];
  } else {
    b.version = 0;
  }

  // Detect engine
  if (/Trident/.test(ua) || b.msie) {
    e.name = 'Trident';
    e.trident = true;
  } else if (/WebKit/.test(ua)) { // must be tested before Gecko
    e.name = 'WebKit';
    e.webkit = true;
  } else if (/Gecko/.test(ua)) {
    e.name = 'Gecko';
    e.gecko = true;
  } else if (/Presto/.test(ua)) {
    e.name = 'Presto';
    e.presto = true;
  } else {
    e.name = 'Other';
    e.unknown = true;
  }

  // Detect engine version
  if (e.trident) {
    e.version = /Trident/.test(ua)? /Trident\/(\d+(\.\d+)*)/.exec(ua)![1]: 0;
  } else if (e.gecko) {
    e.version = /rv:(\d+(\.\d+)*)/.exec(ua)![1];
  } else if (e.webkit) {
    e.version = /WebKit\/(\d+(\.\d+)*)/.exec(ua)![1];
  } else if (e.presto) {
    e.version = /Presto\/(\d+(\.\d+)*)/.exec(ua)![1];
  } else {
    e.version = 0;
  }

  return agent;
};

export const toObject = (arr: any[]) => {
  let result: any = {};
  for (let i = 0; i < arr.length; ++i) {
    const item = arr[i];
    const key = Object.keys(item)[0];
    const value = Object.values(item)[0];

    if (result[key]) {
      result[key] += value;
    } else {
      result[key] = value;
    }
  }
  return result;
};

export const toObj = (arr: any[]) => arr.reduce((acc: any, item: any) => {
  acc[item.name] = item.value;
  return acc;
}, {});

export const toArr = (obj: any, name: string, value: any) => {
  const newSettings: Setting[] = [];
  for (const key of Object.keys(obj)) {
    newSettings.push({ name: key, value: key === name ? value : obj[key] });
  }
  return newSettings
};

export const toArr2 = (obj: any) => {
  const newSettings: Setting[] = [];
  for (const key of Object.keys(obj)) {
    newSettings.push({ name: key, value: obj[key] });
  }
  return newSettings
};

export const formatFileSize = (bytes: number, si: boolean = false, dp: number = 1) => {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  const units = si 
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] 
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  const r = 10**dp;
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + ' ' + units[u];
};