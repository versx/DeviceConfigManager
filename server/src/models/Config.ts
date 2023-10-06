import { DataTypes, Sequelize } from 'sequelize';

import { SequelizeOptions } from '../consts';

export const Config = (sequelize: Sequelize) =>
  sequelize.define('config', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    backendUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dataEndpoints: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    bearerToken: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  }, SequelizeOptions);