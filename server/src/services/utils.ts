import { Request } from 'express';
import { createHash } from 'crypto';
import moment from 'moment';

import { logWarn } from '.';
import { ColorType } from '../types';

// 5 - ukhndyw
// 6 - lktajej
// 7 - 3teb8
// 8 - k0fd
export const randomString = (seed: number = 7) => (Math.random() + 1).toString(36).substring(seed);

export const atob = (encoded: any) => Buffer.from(encoded, 'base64').toString('utf-8');
export const btoa = (decoded: any) => Buffer.from(decoded).toString('base64');

export const isValidUrl = (url: string | null) => {
  if (!url) {
    return false;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }

  return true;
};

export const getIpAddress = async (req: Request, defaultValue: string = '0.0.0.0') => {
  const cfHeader = req.get('cf-connecting-ip');
  const forwardedHost = req.get('x-forwarded-host');
  const forwardedFor = req.get('x-forwarded-for');
  const remoteIp = req.connection.remoteAddress;
  const localIp = req.connection.localAddress;
  let ipAddr = cfHeader ?? forwardedHost ?? forwardedFor ?? remoteIp ?? localIp;
  //const ipAddrTest = ipAddr?.match('[0-9]+.[0-9].+[0-9]+.[0-9]+$')![0];
  if (ipAddr === '127.0.0.1') {
    ipAddr = await getExternalIpAddress();
  }
  return ipAddr ?? defaultValue;
};

export const getExternalIpAddress = async (defaultValue: string = '127.0.0.1') => {
  const apiUrl = 'https://icanhazip.com';
  const response = await fetch(apiUrl);
  if (response?.status !== 200) {
    //throw new Error('Unable to get external IP address.');
    logWarn('Unable to get external IP address.');
    return defaultValue;
  }
  const ipAddr = await response.text();
  return ipAddr;
};

export const getGeolocationDetails = async (ipAddr: string) => {
  // Reference: https://ip-api.com/docs/api:json
  const apiUrl = 'http://ip-api.com/json';
  const response = await fetch(`${apiUrl}/${ipAddr}?fields=66846719`);
  if (response?.status !== 200) {
    //throw new Error('Unable to get geolocation details.');
    logWarn('Unable to get geolocation details.');
    return null;
  }
  const data = await response.json();
  return data;
};

export const color = (color: ColorType, message: any) => {
  const clr = typeToColor(color); //config.logs.colors[color];
  const ctrlChar = '\x1b';
  const start = ctrlChar + clr;
  const end = ColorCodes.Reset;
  const result = `${start}${message}${end}`;
  return result;
};

export const typeToColor = (type: ColorType) => {
  switch (type) {
    case 'date': return ColorCodes.FgCyan;
    case 'error': return ColorCodes.FgRed;
    case 'text': return ColorCodes.FgGray;
    case 'variable': return ColorCodes.FgBlue;
    case 'warn': return ColorCodes.FgYellow;
    default: return ColorCodes.FgGray;
  }
};

export const ColorCodes = {
  Reset: '\x1b[0m',
  Bright: '\x1b[1m',
  Dim: '\x1b[2m',
  Underscore: '\x1b[4m',
  Blink: '\x1b[5m',
  Reverse: '\x1b[7m',
  Hidden: '\x1b[8m',
  
  FgBlack: '\x1b[30m',
  FgRed: '\x1b[31m',
  FgGreen: '\x1b[32m',
  FgYellow: '\x1b[33m',
  FgBlue: '\x1b[34m',
  FgMagenta: '\x1b[35m',
  FgCyan: '\x1b[36m',
  FgWhite: '\x1b[37m',
  FgGray: '\x1b[90m',
  
  BgBlack: '\x1b[40m',
  BgRed: '\x1b[41m',
  BgGreen: '\x1b[42m',
  BgYellow: '\x1b[43m',
  BgBlue: '\x1b[44m',
  BgMagenta: '\x1b[45m',
  BgCyan: '\x1b[46m',
  BgWhite: '\x1b[47m',
  BgGray: '\x1b[100m',
};

export const generateETag = (content: any, algo: string = 'md5') =>
  createHash(algo)
    .update(JSON.stringify(content))
    .digest('hex');

export const formatBytes = (bytes: any) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return 0;
  }
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  if (index === 0) {
    return bytes + ' ' + sizes[index];
  }
  return (bytes / Math.pow(1024, index)).toFixed(1) + ' ' + sizes[index];
};

export const timeToSeconds = (time: string) => {
  const split = time.split(':');
  if (split.length < 3) {
    return 0;
  }

  const hours = parseInt(split[0]) || 0;
  const minutes = parseInt(split[1]) || 0;
  const seconds = parseInt(split[2]) || 0;
  return hours * 3600 + minutes * 60 + seconds;
};

export const todaySeconds = (timezone: string) => {
  const date = convertTimeZone(new Date(), timezone);
  const formattedDate = moment(date).format('HH:mm:ss');
  const seconds = timeToSeconds(formattedDate);
  return seconds;
};

export const convertTimeZone = (date: Date, timezone: string) => {
  const tzDate = moment(date).to(timezone); //moment(date).tz(timezone);
  return tzDate;
};