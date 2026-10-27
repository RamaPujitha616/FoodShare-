import express from 'express';
import { getUsers, updateUser, deleteUser, exportCSV } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All admin routes require admin privileges

router.route('/users')
  .get(getUsers);

router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

router.get('/export/csv', exportCSV);

export default router;
