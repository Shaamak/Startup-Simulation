import { query } from '../config/database';
import { cache, CACHE_KEYS } from '../config/redis';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDto {
  email: string;
  passwordHash: string;
  fullName: string;
}

export const userRepository = {
  async create(dto: CreateUserDto): Promise<UserRow> {
    const { rows } = await query<UserRow>(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [dto.email, dto.passwordHash, dto.fullName]
    );
    return rows[0];
  },

  async findByEmail(email: string): Promise<UserRow | null> {
    const { rows } = await query<UserRow>(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase()]
    );
    return rows[0] ?? null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const cached = await cache.get<UserRow>(CACHE_KEYS.userProfile(id));
    if (cached) return cached;

    const { rows } = await query<UserRow>(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    const user = rows[0] ?? null;
    if (user) await cache.set(CACHE_KEYS.userProfile(id), user, 300); // 5 min TTL
    return user;
  },

  async updateAvatar(id: string, avatarUrl: string): Promise<UserRow> {
    const { rows } = await query<UserRow>(
      `UPDATE users SET avatar_url = $1, updated_at = now()
       WHERE id = $2 RETURNING *`,
      [avatarUrl, id]
    );
    await cache.del(CACHE_KEYS.userProfile(id));
    return rows[0];
  },

  async updateProfile(id: string, fullName: string): Promise<UserRow> {
    const { rows } = await query<UserRow>(
      `UPDATE users SET full_name = $1, updated_at = now()
       WHERE id = $2 RETURNING *`,
      [fullName, id]
    );
    await cache.del(CACHE_KEYS.userProfile(id));
    return rows[0];
  },

  async updatePassword(id: string, newPasswordHash: string): Promise<void> {
    await query(
      `UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2`,
      [newPasswordHash, id]
    );
    await cache.del(CACHE_KEYS.userProfile(id));
  },

  async emailExists(email: string): Promise<boolean> {
    const { rows } = await query<{ count: string }>(
      'SELECT COUNT(1) as count FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return parseInt(rows[0].count) > 0;
  },
};
