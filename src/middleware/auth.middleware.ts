import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { ResponseHandler } from '../utils/response';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json(ResponseHandler.error('未登录'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.json(ResponseHandler.error('登录已过期'));
  }
}; 