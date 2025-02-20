import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public points!: number;
  public nickname!: string;
  public avatar!: string;
  public friendId!: number;
  public friendList!: number[];
  public friendEmail!: string;
  public role!: string;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  nickname: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  friendList: {
    type: DataTypes.JSON,
    allowNull: true
  },
  friendEmail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  role: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'users',
  timestamps: false
});
