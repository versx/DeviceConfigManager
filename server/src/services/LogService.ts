import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { basename, resolve } from 'path';
import { createStream } from 'rotating-file-stream';
import { ILogObjMeta, Logger } from 'tslog';

import { logs } from '../config.json';
import {
  DefaultLogsRotateInterval,
  DefaultLogsRotateMaxFiles,
  DefaultLogsRotateMaxSize,
  LogsFolder,
} from '../consts';
import { LogArchiveModel, LogModel } from '../types';

interface LogsResponse {
  uuid: string;
  logs: LogModel[];
  archives: LogArchiveModel[];
};

const loggers: { [uuid: string]: Logger<any> } = {};

const getLogger = (uuid: string, level: string = 'debug') => {
  if (loggers[uuid]) {
    return loggers[uuid];
  }

  const logFileName = `${uuid}.log`;
  const stream = createStream(logFileName, {
    interval: logs.rotate.interval ?? DefaultLogsRotateInterval,
    compress: 'gzip', // compress rotated files
    maxFiles: logs.rotate.maxFiles ?? DefaultLogsRotateMaxFiles,
    maxSize: logs.rotate.maxSize ?? DefaultLogsRotateMaxSize,
    path: LogsFolder,
  });
  //stream.on('rotation', () => console.log('Log file rotation started:', logFileName));
  //stream.on('rotated', (fileName: string) => console.log('Log file rotated:', fileName));
  //stream.on('removed', (fileName: string) => console.warn('Log file removed:', fileName));
  stream.on('warning', (err: Error) => console.warn('Log file rotation warning:', err));
  stream.on('error', (err: Error) => console.error('Log file rotation error:', err));

  const logger = new Logger({
    name: uuid,
    // 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal
    minLevel: getLogLevel(level), // TODO: Make configurable
    // pretty | json | hidden
    type: 'hidden', // TODO: Make configurable?
    stylePrettyLogs: true,
    prettyLogTemplate: '[{{yyyy}}.{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}}:{{ms}}] [{{logLevelName}}] [{{name}}] ',
  });
  logger.attachTransport((logObj: ILogObjMeta) => {
    createLogFile(uuid);

    const meta = logObj['_meta'];
    const obj = {
      uuid: meta?.name,
      message: logObj['0'],
      date: meta?.date,
      logLevel: meta?.logLevelName,
    };
    stream.write(JSON.stringify(obj) + '\n');
  });

  return loggers[uuid] = logger;
};

const getLogs = (uuid: string, includeArchieved: boolean = false): LogsResponse => {
  createLogFile(uuid);

  const logFileName = `${uuid}.log`;
  const logPath = resolve(LogsFolder, logFileName);
  const json = readFileSync(logPath, { encoding: 'utf-8' });
  if (!json) {
    return { uuid, logs: [], archives: [] };
  }

  const messages = json
    .split('\n')
    .filter((msg) => !!msg)
    .map((msg) => JSON.parse(msg));

  return {
    uuid,
    logs: messages,
    archives: includeArchieved
      ? getLogArchives(uuid)
      : [],
  };
};

const deleteLogs = (uuid: string, includeArchieved: boolean = false) => {
  const logPath = resolve(LogsFolder, `${uuid}.log`);
  if (!existsSync(logPath)) {
    return true;
  }

  try {
    clearLogFile(uuid);
    //writeFileSync(logPath, '');
    //rmSync(logPath, { force: true });

    if (includeArchieved) {
      const archivedLogs = getLogArchives(uuid);
      for (const archivedLog of archivedLogs) {
        try {
          rmSync(archivedLog.path, { force: true });
        } catch (err) {
          console.error('Failed to delete archived log:', err);
        }
      }
    }

    return true;
  } catch (err) {
    console.error('Failed to delete log:', logPath, err);
  }
  return false;
};

const deleteLogArchive = (uuid: string, archive: string) => {
  if (!existsSync(archive)) {
    return true;
  }

  try {
    const manifestPath = resolve(LogsFolder, `${uuid}.log.txt`);
    const manifest = readFileSync(manifestPath, { encoding: 'utf-8' })
      ?.split('\n')
      ?.filter(path => path !== archive)
      ?.join('\n');
    writeFileSync(manifestPath, manifest);
    rmSync(archive, { force: true });

    return true;
  } catch (err) {
    console.error('Failed to delete log archive:', archive, err);
  }
  return false;
};

const createLogFile = (uuid: string) => {
  const path = resolve(LogsFolder, `${uuid}.log`);
  if (existsSync(path)) {
    return;
  }

  writeFileSync(path, '');
};

const clearLogFile = (uuid: string) => {
  const path = resolve(LogsFolder, `${uuid}.log`);
  if (!existsSync(path)) {
    createLogFile(uuid);
    return;
  }

  writeFileSync(path, '');
};

const getLogArchives = (uuid: string, limit: number = 10) => {
  const archiveManifestPath = resolve(LogsFolder, `${uuid}.log.txt`);
  if (!existsSync(archiveManifestPath)) {
    return [];
  }

  const manifest = readFileSync(archiveManifestPath, { encoding: 'utf-8' })
    ?.split('\n')
    ?.filter((path) => !!path);
  const archiveLogPaths = manifest.slice(0, Math.min(limit, manifest.length));
  const archives = [];
  for (const archiveLogPath of archiveLogPaths) {
    if (!existsSync(archiveLogPath)) {
      continue;
    }
    const fileName = basename(archiveLogPath);
    const data = readFileSync(archiveLogPath, { encoding: 'utf-8' });
    const logDate = fileName.split('-')[0];
    const compressed = archiveLogPath.endsWith('.log.gz');
    const date = new Date(
      parseInt(logDate.substr(0,4)), 
      parseInt(logDate.substr(4,2)) - 1, 
      parseInt(logDate.substr(6,2))
    );
    const size = statSync(archiveLogPath).size;
    archives.push({
      path: archiveLogPath,
      fileName,
      data,
      compressed,
      date,
      size,
    });
  }
  return archives;
};

const getLogLevel = (level: string) => {
  switch (level.toLowerCase()) {
    case 'silly': return 0;
    case 'trace': return 1;
    case 'debug': return 2;
    case 'info': return 3;
    case 'warn': return 4;
    case 'error': return 5;
    case 'fatal': return 6;
    default: return 3;
  }
};

export const LogService = {
  getLogger,
  getLogs,
  getLogArchives,
  deleteLogs,
  deleteLogArchive,
};