import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class CheckIn extends Model {
  public id!: number;
  public userId!: number;
  public checkInDate!: Date;
  public continuousDays!: number;
  public points!: number;
}

CheckIn.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  checkInDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  continuousDays: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  }
}, {
  sequelize,
  tableName: 'check_ins',
  timestamps: false
}); 