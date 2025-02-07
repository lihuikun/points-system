/*
 * @Description: 生成的彩票详细信息
 * @Author: lihk
 * @Date: 2025-02-06 11:14:56
 */
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

export enum PrizeTier {
  FIRST = 1,   // 一等奖：5200积分
  SECOND,      // 二等奖：3000积分
  THIRD,       // 三等奖：1000积分
  FOURTH,      // 四等奖：500积分
  FIFTH,       // 五等奖：400积分
  SIXTH,       // 六等奖：300积分
  SEVENTH,     // 七等奖：随机1～200积分
}

export class LotteryTicket extends Model {
  public id!: number;
  public lotteryBookId!: number; // 所属的彩票套ID
  public prizeTier!: PrizeTier;
  public prizeAmount!: number;
  public breakdown!: number[] | null; // 针对一等奖等需要拆分返回的24位数组（存储为 JSON）
  public scratched!: boolean;         // 是否已兑换/刮开
  public scratchAt!: Date | null;     // 刮奖时间
  public winnerId!: number | null;    // 刮奖后中奖者的ID
  public winnerName!: string | null;  // 刮奖后中奖者的昵称
  public winnerAvatar!: string | null;// 刮奖后中奖者的头像
  public createdAt!: Date;
  public updatedAt!: Date;
}

LotteryTicket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    lotteryBookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prizeTier: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prizeAmount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    breakdown: {
      // 存储拆分后的数组，可以使用 JSON 存储数组数据
      type: DataTypes.JSON,
      allowNull: true,
    },
    scratched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    scratchAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    winnerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    winnerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    winnerAvatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'lottery_tickets',
    timestamps: true,
  }
);
