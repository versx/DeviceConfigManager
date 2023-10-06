import { Sequelize } from 'sequelize';

import { Config } from './Config';
import { Device } from './Device';
import { Schedule } from './Schedule';
import { Setting } from './Setting';
import { User } from './User';
import { log, logError } from '../services';
import { AppConfig, SequelizeDatabaseConnection } from '../types';

const config: AppConfig = require('../config.json');
const sequelize = new Sequelize(config.database);

export const db: SequelizeDatabaseConnection = { connection: sequelize };
db.config = Config(sequelize);
db.device = Device(sequelize);
db.schedule = Schedule(sequelize);
db.setting = Setting(sequelize);
db.user = User(sequelize);

//db.config.belongsTo(db.device);
db.config.hasOne(db.device, {
  //as: 'config',
  foreignKey: 'config',
  //onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export const testConnection = async () => {
  try {
    await db.connection.authenticate();
    log('Database connection has been established successfully.');
  } catch (err) {
    logError('Failed to establish a connection to the database');
  }
};