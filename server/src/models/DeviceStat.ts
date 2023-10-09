import { DataTypes, Sequelize } from 'sequelize';

import { SequelizeOptions } from '../consts';

export const DeviceStat = (sequelize: Sequelize) =>
  sequelize.define('deviceStats', {
    uuid: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      primaryKey: true,
      allowNull: false,
    },
    restarts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, SequelizeOptions);