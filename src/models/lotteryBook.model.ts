// 生成20张彩票
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export class LotteryBook extends Model {
  public id!: number;
  public status!: string; // 状态，例如 'active'（当前在用）或 'closed'
  public createdAt!: Date;
  public updatedAt!: Date;
}

LotteryBook.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active', // 默认当前套票为激活状态
    },
  },
  {
    sequelize,
    tableName: 'lottery_books',
    timestamps: true, // 自动生成 createdAt 与 updatedAt 字段
  }
);
