import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Draw extends Model {
  public id!: number;
  public userId!: number;
  public drawDate!: Date;
  public awardName!: string;
  public awardValue!: number;
}

Draw.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  drawDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  awardName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  awardValue: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Draw',
  tableName: 'draws',
  timestamps: false,
  indexes: [
    {
      fields: ['userId', 'drawDate'],  // 为 userId 和 drawDate 字段添加联合索引
    },
  ],
});
