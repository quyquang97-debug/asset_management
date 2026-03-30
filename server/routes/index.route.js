import express from 'express';
import authRoutes from './auth.route';
import userRoutes from './user.route';
import repairRequestRoutes from './repairRequest.route';
import assetRoutes from './asset.route';
import employeeRoutes from './employee.route';

const router = express.Router();

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount user routes at /users
router.use('/users', userRoutes);

// mount repair request routes at /repairRequests
router.use('/repairRequests', repairRequestRoutes);

// mount asset routes at /assets
router.use('/assets', assetRoutes);

// mount employee routes at /employees
router.use('/employees', employeeRoutes);

export default router;