import { Router } from 'express';
import { startupController } from './startup.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { uploadRateLimit } from '../../middleware/rateLimit.middleware';
import { createStartupSchema, updateStartupSchema, startupIdParamSchema } from './startup.schema';
import { upload } from '../uploads/uploads.service';

const router = Router();

// All startup routes require authentication
router.use(authenticate);

router.get('/', startupController.list);
router.post('/', validate(createStartupSchema), startupController.create);

router.get('/:id', validate(startupIdParamSchema, 'params'), startupController.getById);
router.patch('/:id', validate(startupIdParamSchema, 'params'), validate(updateStartupSchema), startupController.update);
router.delete('/:id', validate(startupIdParamSchema, 'params'), startupController.delete);

// File uploads
router.post(
  '/:id/logo',
  uploadRateLimit,
  validate(startupIdParamSchema, 'params'),
  upload.single('logo'),
  startupController.uploadLogo
);
router.post(
  '/:id/banner',
  uploadRateLimit,
  validate(startupIdParamSchema, 'params'),
  upload.single('banner'),
  startupController.uploadBanner
);

export default router;
