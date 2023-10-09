import { DataTypes, Sequelize } from 'sequelize';

import { DefaultWebServerPort, SequelizeOptions } from '../consts';

export const Device = (sequelize: Sequelize) =>
  sequelize.define('device', {
    uuid: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    config: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    ipAddr: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    iosVersion: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    ipaVersion: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    notes: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    webserverPort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: DefaultWebServerPort,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, SequelizeOptions);