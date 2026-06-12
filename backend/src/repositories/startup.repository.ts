import { query } from '../config/database';
import { cache, CACHE_KEYS } from '../config/redis';

export interface StartupRow {
  id: string;
  user_id: string;
  name: string;
  tagline: string | null;
  industry: string;
  category: string;
  pricing_model: string;
  monthly_budget: number;
  target_audience: string;
  logo_url: string | null;
  banner_url: string | null;
  status: 'active' | 'paused' | 'failed' | 'acquired';
  created_at: Date;
  updated_at: Date;
}

export interface CreateStartupDto {
  userId: string;
  name: string;
  tagline?: string;
  industry: string;
  category: string;
  pricingModel: string;
  monthlyBudget: number;
  targetAudience: string;
}

export interface UpdateStartupDto {
  name?: string;
  tagline?: string;
  industry?: string;
  category?: string;
  pricingModel?: string;
  monthlyBudget?: number;
  targetAudience?: string;
  status?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export const startupRepository = {
  async create(dto: CreateStartupDto): Promise<StartupRow> {
    const { rows } = await query<StartupRow>(
      `INSERT INTO startups (user_id, name, tagline, industry, category, pricing_model, monthly_budget, target_audience)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        dto.userId, dto.name, dto.tagline ?? null,
        dto.industry, dto.category, dto.pricingModel,
        dto.monthlyBudget, dto.targetAudience,
      ]
    );
    await cache.del(CACHE_KEYS.userStartups(dto.userId));
    return rows[0];
  },

  async findById(id: string): Promise<StartupRow | null> {
    const cached = await cache.get<StartupRow>(CACHE_KEYS.startup(id));
    if (cached) return cached;

    const { rows } = await query<StartupRow>(
      'SELECT * FROM startups WHERE id = $1 LIMIT 1',
      [id]
    );
    const startup = rows[0] ?? null;
    if (startup) await cache.set(CACHE_KEYS.startup(id), startup, 120);
    return startup;
  },

  async findByUserId(userId: string): Promise<StartupRow[]> {
    const cached = await cache.get<StartupRow[]>(CACHE_KEYS.userStartups(userId));
    if (cached) return cached;

    const { rows } = await query<StartupRow>(
      'SELECT * FROM startups WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    await cache.set(CACHE_KEYS.userStartups(userId), rows, 60);
    return rows;
  },

  async findByIdAndUserId(id: string, userId: string): Promise<StartupRow | null> {
    const { rows } = await query<StartupRow>(
      'SELECT * FROM startups WHERE id = $1 AND user_id = $2 LIMIT 1',
      [id, userId]
    );
    return rows[0] ?? null;
  },

  async update(id: string, userId: string, dto: UpdateStartupDto): Promise<StartupRow | null> {
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    const fieldMap: Record<string, string> = {
      name: 'name', tagline: 'tagline', industry: 'industry',
      category: 'category', pricingModel: 'pricing_model',
      monthlyBudget: 'monthly_budget', targetAudience: 'target_audience',
      status: 'status', logoUrl: 'logo_url', bannerUrl: 'banner_url',
    };

    for (const [dtoKey, colName] of Object.entries(fieldMap)) {
      const val = (dto as Record<string, unknown>)[dtoKey];
      if (val !== undefined) {
        setClauses.push(`${colName} = $${paramIdx++}`);
        values.push(val);
      }
    }

    if (setClauses.length === 0) return this.findById(id);

    setClauses.push(`updated_at = now()`);
    values.push(id, userId);

    const { rows } = await query<StartupRow>(
      `UPDATE startups SET ${setClauses.join(', ')}
       WHERE id = $${paramIdx++} AND user_id = $${paramIdx}
       RETURNING *`,
      values
    );

    if (rows[0]) {
      await cache.del(CACHE_KEYS.startup(id), CACHE_KEYS.userStartups(userId));
    }
    return rows[0] ?? null;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { rowCount } = await query(
      'DELETE FROM startups WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    if (rowCount && rowCount > 0) {
      await cache.del(CACHE_KEYS.startup(id), CACHE_KEYS.userStartups(userId));
      return true;
    }
    return false;
  },
};
