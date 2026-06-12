import { z } from 'zod';

const INDUSTRIES = [
  'SaaS', 'Fintech', 'HealthTech', 'EdTech', 'E-commerce',
  'Gaming', 'AI/ML', 'CleanTech', 'PropTech', 'LegalTech', 'Other',
] as const;

const PRICING_MODELS = ['freemium', 'subscription', 'one-time', 'usage-based', 'marketplace'] as const;

export const createStartupSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  tagline: z.string().max(255).trim().optional(),
  industry: z.enum(INDUSTRIES),
  category: z.string().min(2).max(50).trim(),
  pricingModel: z.enum(PRICING_MODELS),
  monthlyBudget: z.number().positive().max(10_000_000),
  targetAudience: z.string().min(10).max(500).trim(),
});

export const updateStartupSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  tagline: z.string().max(255).trim().optional(),
  industry: z.enum(INDUSTRIES).optional(),
  category: z.string().min(2).max(50).trim().optional(),
  pricingModel: z.enum(PRICING_MODELS).optional(),
  monthlyBudget: z.number().positive().max(10_000_000).optional(),
  targetAudience: z.string().min(10).max(500).trim().optional(),
  status: z.enum(['active', 'paused', 'failed', 'acquired']).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const startupIdParamSchema = z.object({
  id: z.string().uuid('Invalid startup ID'),
});

export type CreateStartupDto = z.infer<typeof createStartupSchema>;
export type UpdateStartupDto = z.infer<typeof updateStartupSchema>;
