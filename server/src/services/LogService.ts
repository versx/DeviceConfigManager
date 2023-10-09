import { resolve } from 'path';
import { Logger } from 'tslog';
import { createStream } from 'rotating-file-stream';

const loggers: { [name: string]: Logger<any> } = {};

const getLoggers = () => loggers;

const getLogger = (name: string, level: string = 'info') => {
  if (loggers[name]) {
    return loggers[name];
  }

  const logFolder = resolve(__dirname, '../../static/logs');
  const logFileName = `${name}.log`;
  //const logPath = resolve(logFolder, logFileName);
  const stream = createStream(logFileName, {
    size: '1M', // rotate every 10 MegaBytes written
    maxSize: '1M', // rotate every 10 MegaBytes written
    interval: '1d', //'1h', // rotate daily
    compress: 'gzip', // compress rotated files
    path: logFolder,
  });
  stream.on('rotated', (filename) => {
    console.log('Log file rotated:', filename);
  });
  stream.on('error', (err) => {
    console.error('Log rotation error:', err);
  });

  const logger = new Logger({
    name,
    //minLevel: level,
    type: 'pretty',
  });
  logger.attachTransport((logObj) => {
    stream.write(JSON.stringify(logObj) + '\n');
  });

  return loggers[name] = logger;
};

const deleteLogger = (name: string) => {
  return true;
};

export const LogService = {
  getLoggers,
  getLogger,
  deleteLogger,
};