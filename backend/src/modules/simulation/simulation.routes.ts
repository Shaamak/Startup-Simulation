import { Router } from 'express';
import { simulationController } from './simulation.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { z } from 'zod';
import { validate } from '../../middleware/validate.middleware';

const router = Router();
const startupIdSchema = z.object({ startupId: z.string().uuid() });

router.use(authenticate);

router.get('/:startupId', validate(startupIdSchema, 'params'), simulationController.getState);
router.post('/:startupId/start', validate(startupIdSchema, 'params'), simulationController.start);
router.post('/:startupId/pause', validate(startupIdSchema, 'params'), simulationController.pause);
router.get('/:startupId/metrics', validate(startupIdSchema, 'params'), simulationController.getMetrics);
router.get('/:startupId/events', validate(startupIdSchema, 'params'), simulationController.getEvents);

// Internal webhook from AI service (no JWT, protected by network only)
router.post('/:startupId/tick', simulationController.tick);

export default router;
