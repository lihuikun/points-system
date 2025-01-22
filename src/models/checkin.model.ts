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
  },
  type: {
    type: DataTypes.STRING, // 使用 STRING 来存储不同类型，如 'sign', 'share', 等
    allowNull: false,
    defaultValue: 'sign' // 默认为签到类型
  }
}, {
  sequelize,
  tableName: 'check_ins',
  timestamps: false
}); 