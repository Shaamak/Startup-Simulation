export interface Startup {
  id: string;
  userId: string;
  name: string;
  tagline: string | null;
  industry: string;
  category: string;
  pricingModel: string;
  monthlyBudget: number;
  targetAudience: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  status: 'active' | 'paused' | 'failed' | 'acquired';
  createdAt: string;
  updatedAt: string;
}

export interface CreateStartupFormData {
  name: string;
  tagline?: string;
  industry: string;
  category: string;
  pricingModel: string;
  monthlyBudget: number;
  targetAudience: string;
}

export const INDUSTRIES = [
  'SaaS', 'Fintech', 'HealthTech', 'EdTech', 'E-commerce',
  'Gaming', 'AI/ML', 'CleanTech', 'PropTech', 'LegalTech', 'Other',
] as const;

export const PRICING_MODELS = [
  { value: 'freemium', label: 'Freemium' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'one-time', label: 'One-Time Purchase' },
  { value: 'usage-based', label: 'Usage-Based' },
  { value: 'marketplace', label: 'Marketplace' },
] as const;
