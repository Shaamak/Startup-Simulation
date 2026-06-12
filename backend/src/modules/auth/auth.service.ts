import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/env';
import { query } from '../../config/database';
import { userRepository } from '../../repositories/user.repository';
import { createError } from '../../middleware/errorHandler.middleware';
import type { JwtPayload } from '../../types';
import type { RegisterDto, LoginDto } from './auth.schema';

const BCRYPT_ROUNDS = 12;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    plan: string;
    avatarUrl: string | null;
  };
  tokens: AuthTokens;
}

// ─── JWT Helpers ────────────────────────────────────────────────────────────

export function signAccessToken(userId: string, email: string): string {
  // 15 minutes in seconds — using number avoids StringValue typing issues
  return jwt.sign({ sub: userId, email }, env.JWT_SECRET, {
    expiresIn: 15 * 60,
  });
}

export function signRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (err: unknown) {
    if (err instanceof jwt.TokenExpiredError) {
      throw createError('Access token expired', 401);
    }
    throw createError('Invalid access token', 401);
  }
}

// ─── Refresh Token DB Operations ────────────────────────────────────────────

async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, hash, expiresAt]
  );
}

async function validateRefreshToken(token: string): Promise<string | null> {
  const hash = crypto.createHash('sha256').update(token).digest('hex');

  const { rows } = await query<{ user_id: string; expires_at: Date }>(
    `SELECT user_id, expires_at FROM refresh_tokens
     WHERE token_hash = $1 LIMIT 1`,
    [hash]
  );

  if (!rows[0]) return null;
  if (new Date() > rows[0].expires_at) {
    await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash]);
    return null;
  }

  return rows[0].user_id;
}

async function revokeRefreshToken(token: string): Promise<void> {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [hash]);
}

async function revokeAllUserTokens(userId: string): Promise<void> {
  await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

// ─── Auth Service ────────────────────────────────────────────────────────────

export const authService = {
  async register(dto: RegisterDto): Promise<AuthResult> {
    const emailExists = await userRepository.emailExists(dto.email);
    if (emailExists) {
      throw createError('An account with this email already exists', 409);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    const user = await userRepository.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      fullName: dto.fullName,
    });

    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = signRefreshToken();
    await storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        plan: user.plan,
        avatarUrl: user.avatar_url,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
    };
  },

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) {
      throw createError('Invalid email or password', 401);
    }

    const accessToken = signAccessToken(user.id, user.email);
    const refreshToken = signRefreshToken();
    await storeRefreshToken(user.id, refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        plan: user.plan,
        avatarUrl: user.avatar_url,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60,
      },
    };
  },

  async refresh(token: string): Promise<{ accessToken: string; expiresIn: number }> {
    const userId = await validateRefreshToken(token);
    if (!userId) {
      throw createError('Invalid or expired refresh token', 401);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw createError('User not found', 401);
    }

    // Rotate: revoke old, issue new
    await revokeRefreshToken(token);
    const newRefreshToken = signRefreshToken();
    await storeRefreshToken(userId, newRefreshToken);

    const accessToken = signAccessToken(user.id, user.email);

    return { accessToken, expiresIn: 15 * 60 };
  },

  async logout(token: string): Promise<void> {
    await revokeRefreshToken(token);
  },

  async logoutAll(userId: string): Promise<void> {
    await revokeAllUserTokens(userId);
  },
};
