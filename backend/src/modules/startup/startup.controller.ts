import { Request, Response, NextFunction } from 'express';
import { startupService } from './startup.service';
import type { CreateStartupDto, UpdateStartupDto } from './startup.schema';

export const startupController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startup = await startupService.create(req.user!.id, req.body as CreateStartupDto);
      res.status(201).json({ success: true, data: startup });
    } catch (err) { next(err); }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startups = await startupService.list(req.user!.id);
      res.status(200).json({ success: true, data: startups });
    } catch (err) { next(err); }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startup = await startupService.getById(req.params.id, req.user!.id);
      res.status(200).json({ success: true, data: startup });
    } catch (err) { next(err); }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const startup = await startupService.update(req.params.id, req.user!.id, req.body as UpdateStartupDto);
      res.status(200).json({ success: true, data: startup });
    } catch (err) { next(err); }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await startupService.delete(req.params.id, req.user!.id);
      res.status(200).json({ success: true, message: 'Startup deleted' });
    } catch (err) { next(err); }
  },

  async uploadLogo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }
      const logoUrl = `/uploads/${req.file.filename}`;
      const startup = await startupService.updateLogo(req.params.id, req.user!.id, logoUrl);
      res.status(200).json({ success: true, data: { logoUrl: startup.logo_url } });
    } catch (err) { next(err); }
  },

  async uploadBanner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: 'No file uploaded' });
        return;
      }
      const bannerUrl = `/uploads/${req.file.filename}`;
      const startup = await startupService.updateBanner(req.params.id, req.user!.id, bannerUrl);
      res.status(200).json({ success: true, data: { bannerUrl: startup.banner_url } });
    } catch (err) { next(err); }
  },
};
