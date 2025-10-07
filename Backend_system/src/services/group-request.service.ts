import { Collection, ObjectId } from 'mongodb';
import { mongoDB } from '../db/mongodb';
import { IGroupRequest, IGroupRequestCreate, IGroupRequestUpdate, GroupRequestModel } from '../models/group-request.model';
import { groupService } from './group.service';
import { userService } from './user.service';

export class GroupRequestService {
    private collection: Collection<IGroupRequest> | null = null;

    constructor() {
        // Lazy initialization - will be set when first method is called
    }

    private getCollection(): Collection<IGroupRequest> {
        if (!this.collection) {
            this.collection = mongoDB.getCollection<IGroupRequest>('groupRequests');
        }
        return this.collection;
    }

    /**
     * Get all group requests with pagination and filters
     */
    async getGroupRequests(options: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        groupId?: string;
        requestType?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    } = {}): Promise<{
        requests: IGroupRequest[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }> {
        try {
            const page = options.page || 1;
            const limit = options.limit || 10;
            const skip = (page - 1) * limit;

            // Build filter object
            const filter: any = {};

            if (options.search) {
                filter.$or = [
                    { username: { $regex: options.search, $options: 'i' } },
                    { groupName: { $regex: options.search, $options: 'i' } },
                    { message: { $regex: options.search, $options: 'i' } }
                ];
            }

            if (options.status) {
                filter.status = options.status;
            }

            if (options.groupId && ObjectId.isValid(options.groupId)) {
                filter.groupId = new ObjectId(options.groupId);
            }

            if (options.requestType) {
                filter.requestType = options.requestType;
            }

            // Build sort object
            const sort: any = {};
            const sortBy = options.sortBy || 'requestedAt';
            const sortOrder = options.sortOrder || 'desc';
            sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

            const [requests, total] = await Promise.all([
                this.getCollection().find(filter).sort(sort).skip(skip).limit(limit).toArray(),
                this.getCollection().countDocuments(filter)
            ]);

            return {
                requests,
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            };
        } catch (error) {
            console.error('Error getting group requests:', error);
            throw error;
        }
    }

    /**
     * Get group request by ID
     */
    async getGroupRequestById(requestId: string): Promise<IGroupRequest | null> {
        try {
            if (!ObjectId.isValid(requestId)) {
                throw new Error('Invalid request ID format');
            }

            const request = await this.getCollection().findOne({ _id: new ObjectId(requestId) });
            return request;
        } catch (error) {
            console.error('Error getting group request by ID:', error);
            throw error;
        }
    }

    /**
     * Create a new group request
     */
    async createGroupRequest(requestData: IGroupRequestCreate): Promise<IGroupRequest> {
        try {
            const request = GroupRequestModel.toCreate(requestData);
            const result = await this.getCollection().insertOne({
                ...request,
                status: 'pending',
                requestedAt: new Date()
            } as IGroupRequest);

            const createdRequest = await this.getCollection().findOne({ _id: result.insertedId });
            if (!createdRequest) {
                throw new Error('Failed to create group request');
            }

            return createdRequest;
        } catch (error) {
            console.error('Error creating group request:', error);
            throw error;
        }
    }

    /**
     * Update group request
     */
    async updateGroupRequest(requestId: string, updateData: IGroupRequestUpdate): Promise<IGroupRequest | null> {
        try {
            if (!ObjectId.isValid(requestId)) {
                throw new Error('Invalid request ID format');
            }

            const update = GroupRequestModel.toUpdate(updateData);
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(requestId) },
                { $set: update },
                { returnDocument: 'after' }
            );

            return result;
        } catch (error) {
            console.error('Error updating group request:', error);
            throw error;
        }
    }

    /**
     * Approve a group request
     */
    async approveRequest(requestId: string, reviewedBy: ObjectId, reviewerName: string, reason?: string): Promise<IGroupRequest | null> {
        try {
            // First get the request to get user and group info
            const request = await this.getCollection().findOne({ _id: new ObjectId(requestId) });
            if (!request) {
                throw new Error('Group request not found');
            }

            // Update the request status
            const updatedRequest = await this.updateGroupRequest(requestId, {
                status: 'approved',
                reviewedBy,
                reviewerName,
                reason
            });

            // Add user to the group
            if (updatedRequest) {
                await groupService.addMember(
                    request.groupId.toString(),
                    request.userId.toString(),
                    request.username
                );

                // Also add group to user's groups array
                await userService.addToGroup(
                    request.userId.toString(),
                    request.groupId.toString()
                );
            }

            return updatedRequest;
        } catch (error) {
            console.error('Error approving group request:', error);
            throw error;
        }
    }

    /**
     * Reject a group request
     */
    async rejectRequest(requestId: string, reviewedBy: ObjectId, reviewerName: string, reason?: string): Promise<IGroupRequest | null> {
        try {
            return await this.updateGroupRequest(requestId, {
                status: 'rejected',
                reviewedBy,
                reviewerName,
                reason
            });
        } catch (error) {
            console.error('Error rejecting group request:', error);
            throw error;
        }
    }

    /**
     * Delete a group request
     */
    async deleteGroupRequest(requestId: string): Promise<boolean> {
        try {
            if (!ObjectId.isValid(requestId)) {
                throw new Error('Invalid request ID format');
            }

            const result = await this.getCollection().deleteOne({ _id: new ObjectId(requestId) });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting group request:', error);
            throw error;
        }
    }

    /**
     * Get group request statistics
     */
    async getGroupRequestStats(): Promise<{
        totalRequests: number;
        pendingRequests: number;
        approvedRequests: number;
        rejectedRequests: number;
    }> {
        try {
            const [totalRequests, pendingRequests, approvedRequests, rejectedRequests] = await Promise.all([
                this.getCollection().countDocuments({}),
                this.getCollection().countDocuments({ status: 'pending' }),
                this.getCollection().countDocuments({ status: 'approved' }),
                this.getCollection().countDocuments({ status: 'rejected' })
            ]);

            return {
                totalRequests,
                pendingRequests,
                approvedRequests,
                rejectedRequests
            };
        } catch (error) {
            console.error('Error getting group request stats:', error);
            throw error;
        }
    }

    /**
     * Bulk approve requests
     */
    async bulkApproveRequests(requestIds: string[], reviewedBy: ObjectId, reviewerName: string, reason?: string): Promise<number> {
        try {
            const validIds = requestIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
            if (validIds.length === 0) {
                throw new Error('No valid request IDs provided');
            }

            const result = await this.getCollection().updateMany(
                { _id: { $in: validIds } },
                {
                    $set: {
                        status: 'approved',
                        reviewedBy,
                        reviewerName,
                        reason,
                        reviewedAt: new Date()
                    }
                }
            );

            return result.modifiedCount;
        } catch (error) {
            console.error('Error bulk approving requests:', error);
            throw error;
        }
    }

    /**
     * Bulk reject requests
     */
    async bulkRejectRequests(requestIds: string[], reviewedBy: ObjectId, reviewerName: string, reason?: string): Promise<number> {
        try {
            const validIds = requestIds.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
            if (validIds.length === 0) {
                throw new Error('No valid request IDs provided');
            }

            const result = await this.getCollection().updateMany(
                { _id: { $in: validIds } },
                {
                    $set: {
                        status: 'rejected',
                        reviewedBy,
                        reviewerName,
                        reason,
                        reviewedAt: new Date()
                    }
                }
            );

            return result.modifiedCount;
        } catch (error) {
            console.error('Error bulk rejecting requests:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const groupRequestService = new GroupRequestService();
