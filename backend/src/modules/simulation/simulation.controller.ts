import { Request, Response, NextFunction } from 'express';
import { simulationService } from './simulation.service';

export const simulationController = {
  async getState(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await simulationService.getState(req.params.startupId, req.user!.id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await simulationService.start(req.params.startupId, req.user!.id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async pause(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await simulationService.pause(req.params.startupId, req.user!.id);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 90;
      const data = await simulationService.getMetrics(req.params.startupId, req.user!.id, limit);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await simulationService.getEvents(req.params.startupId, req.user!.id, limit);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },

  // Webhook called by AI service
  async tick(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startupId } = req.params;
      const data = await simulationService.applyTick(startupId, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) { next(err); }
  },
};
