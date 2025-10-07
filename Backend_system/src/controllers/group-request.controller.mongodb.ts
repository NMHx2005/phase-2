import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { groupRequestService } from '../services/group-request.service';
import { GroupRequestModel } from '../models/group-request.model';
import { GroupService } from '../services/group.service';

export class GroupRequestController {
    /**
     * Get all group requests with pagination
     */
    static async getGroupRequests(req: Request, res: Response): Promise<void> {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                status,
                groupId,
                requestType,
                sortBy,
                sortOrder
            } = req.query;

            const result = await groupRequestService.getGroupRequests({
                page: parseInt(page as string),
                limit: parseInt(limit as string),
                search: search as string,
                status: status as string,
                groupId: groupId as string,
                requestType: requestType as string,
                sortBy: sortBy as string,
                sortOrder: sortOrder as 'asc' | 'desc'
            });

            const response = {
                requests: result.requests.map(request => GroupRequestModel.toResponse(request)),
                total: result.total,
                page: result.page,
                pages: result.pages,
                limit: result.limit
            };

            res.json({
                success: true,
                data: response
            });
        } catch (error: any) {
            console.error('Error getting group requests:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    /**
     * Get group request by ID
     */
    static async getGroupRequestById(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;
            if (!requestId) {
                res.status(400).json({
                    success: false,
                    message: 'Request ID is required'
                });
                return;
            }

            const request = await groupRequestService.getGroupRequestById(requestId);
            if (!request) {
                res.status(404).json({
                    success: false,
                    message: 'Group request not found'
                });
                return;
            }

            res.json({
                success: true,
                data: GroupRequestModel.toResponse(request)
            });
        } catch (error: any) {
            console.error('Error getting group request by ID:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    /**
     * Create a new group request
     */
    static async createGroupRequest(req: Request, res: Response): Promise<void> {
        try {
            const requestData = {
                ...req.body,
                userId: new ObjectId(req.user?.id),
                username: req.user?.username,
                userEmail: req.user?.email
            };

            // Validate required fields
            if (!requestData.groupId || !ObjectId.isValid(requestData.groupId)) {
                res.status(400).json({
                    success: false,
                    message: 'Valid group ID is required'
                });
                return;
            }

            requestData.groupId = new ObjectId(requestData.groupId);

            // Get group name
            const groupService = new GroupService();
            const group = await groupService.findById(requestData.groupId.toString());
            if (group) {
                requestData.groupName = group.name;
            }

            const request = await groupRequestService.createGroupRequest(requestData);

            res.status(201).json({
                success: true,
                data: GroupRequestModel.toResponse(request),
                message: 'Group request created successfully'
            });
        } catch (error: any) {
            console.error('Error creating group request:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    /**
     * Approve a group request
     */
    static async approveRequest(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;
            const { reason } = req.body;

            if (!requestId) {
                res.status(400).json({
                    success: false,
                    message: 'Request ID is required'
                });
                return;
            }

            if (!ObjectId.isValid(requestId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid request ID format'
                });
                return;
            }

            const request = await groupRequestService.approveRequest(
                requestId,
                new ObjectId(req.user?.id),
                req.user?.username || 'Admin',
                reason
            );

            if (!request) {
                res.status(404).json({
                    success: false,
                    message: 'Group request not found'
                });
                return;
            }

            res.json({
                success: true,
                data: GroupRequestModel.toResponse(request),
                message: 'Group request approved successfully'
            });
        } catch (error: any) {
            console.error('Error approving group request:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    /**
     * Reject a group request
     */
    static async rejectRequest(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;
            const { reason } = req.body;

            if (!requestId) {
                res.status(400).json({
                    success: false,
                    message: 'Request ID is required'
                });
                return;
            }

            if (!ObjectId.isValid(requestId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid request ID format'
                });
                return;
            }

            const request = await groupRequestService.rejectRequest(
                requestId,
                new ObjectId(req.user?.id),
                req.user?.username || 'Admin',
                reason
            );

            if (!request) {
                res.status(404).json({
                    success: false,
                    message: 'Group request not found'
                });
                return;
            }

            res.json({
                success: true,
                data: GroupRequestModel.toResponse(request),
                message: 'Group request rejected successfully'
            });
        } catch (error: any) {
            console.error('Error rejecting group request:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    /**
     * Delete a group request
     */
    static async deleteRequest(req: Request, res: Response): Promise<void> {
        try {
            const { requestId } = req.params;

            if (!requestId) {
                res.status(400).json({
                    success: false,
                    message: 'Request ID is required'
                });
                return;
            }

            const deleted = await groupRequestService.deleteGroupRequest(requestId);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Group request not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Group request deleted successfully'
            });
        } catch (error: any) {
            console.error('Error deleting group request:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    /**
     * Get group request statistics
     */
    static async getGroupRequestStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await groupRequestService.getGroupRequestStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error: any) {
            console.error('Error getting group request stats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    /**
     * Bulk approve requests
     */
    static async bulkApproveRequests(req: Request, res: Response): Promise<void> {
        try {
            const { requestIds, reason } = req.body;

            if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Request IDs array is required'
                });
                return;
            }

            const approvedCount = await groupRequestService.bulkApproveRequests(
                requestIds,
                new ObjectId(req.user?.id),
                req.user?.username || 'Admin',
                reason
            );

            res.json({
                success: true,
                data: { approvedCount },
                message: `${approvedCount} requests approved successfully`
            });
        } catch (error: any) {
            console.error('Error bulk approving requests:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }

    /**
     * Bulk reject requests
     */
    static async bulkRejectRequests(req: Request, res: Response): Promise<void> {
        try {
            const { requestIds, reason } = req.body;

            if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Request IDs array is required'
                });
                return;
            }

            const rejectedCount = await groupRequestService.bulkRejectRequests(
                requestIds,
                new ObjectId(req.user?.id),
                req.user?.username || 'Admin',
                reason
            );

            res.json({
                success: true,
                data: { rejectedCount },
                message: `${rejectedCount} requests rejected successfully`
            });
        } catch (error: any) {
            console.error('Error bulk rejecting requests:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Internal server error'
            });
        }
    }
}
