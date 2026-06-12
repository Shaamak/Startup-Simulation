import { simulationRepository } from '../../repositories/simulation.repository';
import { startupRepository } from '../../repositories/startup.repository';
import { createError } from '../../middleware/errorHandler.middleware';
import { socketEmit } from '../../config/socket';
import axios from 'axios';
import { env } from '../../config/env';

export const simulationService = {
  async getState(startupId: string, userId: string) {
    const startup = await startupRepository.findByIdAndUserId(startupId, userId);
    if (!startup) throw createError('Startup not found', 404);

    const simulation = await simulationRepository.getOrCreate(startupId);
    return simulation;
  },

  async start(startupId: string, userId: string) {
    const startup = await startupRepository.findByIdAndUserId(startupId, userId);
    if (!startup) throw createError('Startup not found', 404);

    await simulationRepository.update(startupId, { is_running: true });

    // Notify AI service to begin background simulation
    try {
      await axios.post(`${env.AI_SERVICE_URL}/simulate/start`, {
        startupId,
        industry: startup.industry,
        pricingModel: startup.pricing_model,
        monthlyBudget: startup.monthly_budget,
        targetAudience: startup.target_audience,
        category: startup.category,
      });
    } catch (err) {
      // AI service unavailable — mark as not running and re-throw
      await simulationRepository.update(startupId, { is_running: false });
      throw createError('AI simulation service is unavailable', 503);
    }

    socketEmit.simulationStarted(startupId);
    return simulationRepository.findByStartupId(startupId);
  },

  async pause(startupId: string, userId: string) {
    const startup = await startupRepository.findByIdAndUserId(startupId, userId);
    if (!startup) throw createError('Startup not found', 404);

    await simulationRepository.update(startupId, { is_running: false });

    try {
      await axios.post(`${env.AI_SERVICE_URL}/simulate/stop`, { startupId });
    } catch {
      // Best-effort
    }

    socketEmit.simulationPaused(startupId);
    return simulationRepository.findByStartupId(startupId);
  },

  async getMetrics(startupId: string, userId: string, limit = 90) {
    const startup = await startupRepository.findByIdAndUserId(startupId, userId);
    if (!startup) throw createError('Startup not found', 404);
    return simulationRepository.getMetrics(startupId, limit);
  },

  async getEvents(startupId: string, userId: string, limit = 20) {
    const startup = await startupRepository.findByIdAndUserId(startupId, userId);
    if (!startup) throw createError('Startup not found', 404);
    return simulationRepository.getEvents(startupId, limit);
  },

  // Called by AI service webhook when a tick completes
  async applyTick(startupId: string, tickData: Record<string, unknown>) {
    const updated = await simulationRepository.update(startupId, {
      simulation_day: tickData.day as number,
      customers: tickData.customers as number,
      mrr: tickData.mrr as number,
      arr: (tickData.mrr as number) * 12,
      churn_rate: tickData.churn_rate as number,
      valuation: tickData.valuation as number,
      runway_months: tickData.runway_months as number,
      popularity_score: tickData.popularity_score as number,
      investor_interest: tickData.investor_interest as number,
      funding_raised: tickData.funding_raised as number,
      funding_round: tickData.funding_round as string,
      total_revenue: tickData.total_revenue as number,
      burn_rate: tickData.burn_rate as number,
    });

    // Record time-series snapshot
    await simulationRepository.recordMetric(startupId, {
      day: updated.simulation_day,
      customers: updated.customers,
      mrr: updated.mrr,
      churn_rate: updated.churn_rate,
      valuation: updated.valuation,
      burn_rate: updated.burn_rate,
    });

    // Broadcast to connected clients
    socketEmit.simulationTick(startupId, updated);

    // Handle notable events from AI
    if (tickData.events && Array.isArray(tickData.events)) {
      for (const ev of tickData.events as Array<{
        event_type: string; title: string; description: string; impact: 'positive' | 'negative' | 'neutral';
      }>) {
        const savedEvent = await simulationRepository.createEvent(startupId, {
          event_type: ev.event_type,
          title: ev.title,
          description: ev.description,
          impact: ev.impact,
          metadata: {},
        });
        socketEmit.simulationEvent(startupId, savedEvent);
      }
    }

    return updated;
  },
};
