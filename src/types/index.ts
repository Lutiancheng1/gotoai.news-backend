import { Request } from 'express';
import { IUser } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export interface FileRequest extends AuthRequest {
  file?: Express.Multer.File;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  [key: string]: any;
} 