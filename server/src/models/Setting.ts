import { DataTypes, Sequelize } from 'sequelize';

import { SequelizeOptions } from '../consts';

export const Setting = (sequelize: Sequelize) =>
  sequelize.define('setting', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, SequelizeOptions);