import { DataTypes, Sequelize } from 'sequelize';

import { SequelizeOptions } from '../consts';

export const Schedule = (sequelize: Sequelize) =>
  sequelize.define('schedule', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    config: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uuids: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    timezoneOffset: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    nextConfig: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, SequelizeOptions);