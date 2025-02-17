import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { Post } from './post.model';
import { User } from './user.model';

export class Comment extends Model {
  public id!: number;
  public userId!: number;
  public postId!: number;
  public content!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  static associate: (models: any) => void;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Comment',
    timestamps: true
  }
);