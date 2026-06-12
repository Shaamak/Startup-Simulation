import { startupRepository } from '../../repositories/startup.repository';
import { simulationRepository } from '../../repositories/simulation.repository';
import { createError } from '../../middleware/errorHandler.middleware';
import type { CreateStartupDto, UpdateStartupDto } from './startup.schema';

export const startupService = {
  async create(userId: string, dto: CreateStartupDto) {
    const startup = await startupRepository.create({
      userId,
      name: dto.name,
      tagline: dto.tagline,
      industry: dto.industry,
      category: dto.category,
      pricingModel: dto.pricingModel,
      monthlyBudget: dto.monthlyBudget,
      targetAudience: dto.targetAudience,
    });

    // Initialize simulation record
    await simulationRepository.getOrCreate(startup.id);

    return startup;
  },

  async list(userId: string) {
    return startupRepository.findByUserId(userId);
  },

  async getById(id: string, userId: string) {
    const startup = await startupRepository.findByIdAndUserId(id, userId);
    if (!startup) throw createError('Startup not found', 404);
    return startup;
  },

  async update(id: string, userId: string, dto: UpdateStartupDto) {
    const startup = await startupRepository.update(id, userId, {
      name: dto.name,
      tagline: dto.tagline,
      industry: dto.industry,
      category: dto.category,
      pricingModel: dto.pricingModel,
      monthlyBudget: dto.monthlyBudget,
      targetAudience: dto.targetAudience,
      status: dto.status,
    });
    if (!startup) throw createError('Startup not found', 404);
    return startup;
  },

  async delete(id: string, userId: string) {
    const deleted = await startupRepository.delete(id, userId);
    if (!deleted) throw createError('Startup not found', 404);
  },

  async updateLogo(id: string, userId: string, logoUrl: string) {
    const startup = await startupRepository.update(id, userId, { logoUrl });
    if (!startup) throw createError('Startup not found', 404);
    return startup;
  },

  async updateBanner(id: string, userId: string, bannerUrl: string) {
    const startup = await startupRepository.update(id, userId, { bannerUrl });
    if (!startup) throw createError('Startup not found', 404);
    return startup;
  },
};
