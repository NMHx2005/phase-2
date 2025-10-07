import { Router } from 'express';
import { GroupRequestController } from '../controllers/group-request.controller.mongodb';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all group requests with pagination
router.get('/', GroupRequestController.getGroupRequests);

// Get group request statistics
router.get('/stats', GroupRequestController.getGroupRequestStats);

// Create a new group request
router.post('/', GroupRequestController.createGroupRequest);

// Bulk approve requests
router.post('/bulk/approve', GroupRequestController.bulkApproveRequests);

// Bulk reject requests
router.post('/bulk/reject', GroupRequestController.bulkRejectRequests);

// Get group request by ID
router.get('/:requestId', GroupRequestController.getGroupRequestById);

// Approve a group request
router.post('/:requestId/approve', GroupRequestController.approveRequest);

// Reject a group request
router.post('/:requestId/reject', GroupRequestController.rejectRequest);

// Delete a group request
router.delete('/:requestId', GroupRequestController.deleteRequest);

export default router;
