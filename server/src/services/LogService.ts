import { resolve } from 'path';
import pino, { Logger } from 'pino';

const loggers: { [name: string]: Logger } = {};

const getLoggers = () => loggers;

const getLogger = (name: string, level: string = 'info') => {
  if (loggers[name]) {
    return loggers[name];
  }

  const logPath = resolve(`./static/logs/${name}.log`);
  return loggers[name] = pino({
    name,
    level,
    timestamp: true,
    enabled: true,
    //redact: {
    //  paths: ['hostname'],
    //  censor: ''
    //},
    base: undefined,
    transport: {
      targets: [{
        target: 'pino-pretty',
        level,
        options: {
          colorize: true,
        },
      },{
        target: 'pino/file',
        level,
        options: {
          destination: logPath,
          //minLength: 4096, // Buffer before writing
          append: true,
          sync: false,
        },
      }],
    },
  });
};

const deleteLogger = (name: string) => {
  return true;
};

export const LogService = {
  getLoggers,
  getLogger,
  deleteLogger,
};