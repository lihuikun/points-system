import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Redemption extends Model {
  public id!: number;
  public userId!: number;
  public giftId!: number;
  public pointsUsed!: number;
  public createdAt!: Date;
}

Redemption.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    giftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pointsUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Redemption',
    tableName: 'redemptions',
    timestamps: false,
  }
);