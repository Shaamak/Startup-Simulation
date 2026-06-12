import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { authService } from './auth.service';
import { userRepository } from '../../repositories/user.repository';
import { createError } from '../../middleware/errorHandler.middleware';
import type { RegisterDto, LoginDto, RefreshTokenDto } from './auth.schema';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: RegisterDto = req.body;
      const result = await authService.register(dto);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto: LoginDto = req.body;
      const result = await authService.login(dto);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenDto = req.body;
      const result = await authService.refresh(refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenDto = req.body;
      await authService.logout(refreshToken);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await userRepository.findById(req.user!.id);
      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }
      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          plan: user.plan,
          avatarUrl: user.avatar_url,
          isVerified: user.is_verified,
          createdAt: user.created_at,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName } = req.body;
      if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
        throw createError('Full name must be at least 2 characters', 400);
      }
      const user = await userRepository.updateProfile(req.user!.id, fullName.trim());
      res.status(200).json({
        success: true,
        data: { id: user.id, email: user.email, fullName: user.full_name, plan: user.plan },
      });
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) throw createError('Both passwords are required', 400);
      if (newPassword.length < 8) throw createError('New password must be at least 8 characters', 400);

      const user = await userRepository.findById(req.user!.id);
      if (!user) throw createError('User not found', 404);

      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) throw createError('Current password is incorrect', 401);

      const newHash = await bcrypt.hash(newPassword, 12);
      await userRepository.updatePassword(req.user!.id, newHash);

      res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
      next(err);
    }
  },
};
