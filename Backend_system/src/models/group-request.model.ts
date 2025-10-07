import { ObjectId, Document } from 'mongodb';

export interface IGroupRequest extends Document {
    _id?: ObjectId;
    userId: ObjectId;
    username: string;
    userEmail?: string;
    groupId: ObjectId;
    groupName: string;
    requestType: 'register_interest' | 'request_invite';
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: ObjectId;
    reviewerName?: string;
    reason?: string;
    message?: string;
}

export interface IGroupRequestCreate {
    userId: ObjectId;
    username: string;
    userEmail?: string;
    groupId: ObjectId;
    groupName: string;
    requestType: 'register_interest' | 'request_invite';
    message?: string;
}

export interface IGroupRequestUpdate {
    status?: 'pending' | 'approved' | 'rejected';
    reviewedBy?: ObjectId;
    reviewerName?: string;
    reason?: string;
}

export interface IGroupRequestResponse {
    _id: string;
    userId: string;
    username: string;
    userEmail?: string;
    groupId: string;
    groupName: string;
    requestType: 'register_interest' | 'request_invite';
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    reviewerName?: string;
    reason?: string;
    message?: string;
}

export class GroupRequestModel {
    static toResponse(request: IGroupRequest): IGroupRequestResponse {
        return {
            _id: request._id?.toString() || '',
            userId: request.userId.toString(),
            username: request.username,
            userEmail: request.userEmail,
            groupId: request.groupId.toString(),
            groupName: request.groupName,
            requestType: request.requestType,
            status: request.status,
            requestedAt: request.requestedAt.toISOString(),
            reviewedAt: request.reviewedAt?.toISOString(),
            reviewedBy: request.reviewedBy?.toString(),
            reviewerName: request.reviewerName,
            reason: request.reason,
            message: request.message
        };
    }

    static toCreate(data: IGroupRequestCreate): Omit<IGroupRequest, '_id' | 'status' | 'requestedAt' | 'reviewedAt' | 'reviewedBy' | 'reviewerName' | 'reason'> {
        return {
            userId: data.userId,
            username: data.username,
            userEmail: data.userEmail,
            groupId: data.groupId,
            groupName: data.groupName,
            requestType: data.requestType,
            message: data.message
        };
    }

    static toUpdate(data: IGroupRequestUpdate): Partial<IGroupRequest> {
        const update: Partial<IGroupRequest> = {};

        if (data.status !== undefined) update.status = data.status;
        if (data.reviewedBy !== undefined) update.reviewedBy = data.reviewedBy;
        if (data.reviewerName !== undefined) update.reviewerName = data.reviewerName;
        if (data.reason !== undefined) update.reason = data.reason;

        if (data.status && data.status !== 'pending') {
            update.reviewedAt = new Date();
        }

        return update;
    }
}