import express from 'express';
import { createDonation, getDonations, getDonationById, updateDonation } from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All donation routes require auth

router.route('/')
  .get(getDonations)
  .post(authorize('donor'), createDonation);

router.route('/:id')
  .get(getDonationById)
  .put(updateDonation);

export default router;
