import { DataTypes, Model, Sequelize } from 'sequelize';
import { sequelize } from '../config/database';

export class Gift extends Model {
  public id!: number; // 主键
  public name!: string; // 礼品名称
  public points!: number; // 礼品兑换需要的积分
  public stock!: number; // 库存
  public createdAt!: Date; // 创建时间
}

Gift.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock: {
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
    modelName: 'Gift',
    tableName: 'gifts',
    timestamps: false,
    indexes: [
      {
        fields: ['name'], // 为 name 字段添加索引
      },
    ],
  }
);