import { DataTypes, Sequelize } from 'sequelize';

import { SequelizeOptions } from '../consts';

export const RefreshToken = (sequelize: Sequelize) =>
  sequelize.define('refreshToken', {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  }, SequelizeOptions);