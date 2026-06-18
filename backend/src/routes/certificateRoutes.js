import express from 'express';
import {
  getCertificates,
  getCertificateById,
  verifyCertificate,
  downloadCertificate,
} from '../controllers/certificateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public verification route
router.get('/:id/verify', verifyCertificate);

// All other routes require authentication
router.use(protect);

router.get('/', getCertificates);
router.get('/:id', getCertificateById);
router.get('/:id/download', downloadCertificate);

export default router;
