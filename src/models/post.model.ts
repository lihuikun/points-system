import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

export class Post extends Model {
  public id!: number;
  public userId!: number;
  public content!: string;
  public images!: string[];
  public location!: string;
  public createdAt!: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true, // 文本内容
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true, // 图片数组
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true, // 位置
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Post',
    tableName: 'posts',
  }
);

Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });