import { Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

export const auth: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'No authentication token, access denied' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      userId: string;
      role: string;
    };
    
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const adminOnly: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied. Admin only.' });
      return;
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
}; 