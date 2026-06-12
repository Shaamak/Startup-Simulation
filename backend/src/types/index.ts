import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  plan: 'free' | 'pro' | 'enterprise';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}
