import { ObjectId, Document } from 'mongodb';

export interface IGroup extends Document {
    _id?: ObjectId;
    name: string;
    description: string;
    category?: string;
    members: Array<{
        userId: ObjectId;
        username: string;
        role: 'admin' | 'member';
        joinedAt: Date;
    }>;
    admins: ObjectId[];
    isActive: boolean;
    status: 'active' | 'inactive' | 'pending';
    isPrivate: boolean;
    maxMembers?: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: ObjectId;
    avatar?: string;
    tags?: string[];
    rules?: string[];
}

export interface IGroupCreate {
    name: string;
    description: string;
    status?: 'active' | 'inactive' | 'pending';
    isPrivate?: boolean;
    maxMembers?: number;
    createdBy: ObjectId;
    avatar?: string;
    tags?: string[];
    rules?: string[];
}

export interface IGroupUpdate {
    name?: string;
    description?: string;
    status?: 'active' | 'inactive' | 'pending';
    isPrivate?: boolean;
    maxMembers?: number;
    avatar?: string;
    tags?: string[];
    rules?: string[];
    isActive?: boolean;
}

export interface IGroupResponse {
    _id: string;
    name: string;
    description: string;
    category?: string;
    members: Array<{
        userId: string;
        username: string;
        role: 'admin' | 'member';
        joinedAt: string;
    }>;
    admins: string[];
    isActive: boolean;
    status: 'active' | 'inactive' | 'pending';
    isPrivate: boolean;
    maxMembers?: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    avatar?: string;
    tags?: string[];
    rules?: string[];
    memberCount: number;
}

export class GroupModel {
    static toResponse(group: IGroup): IGroupResponse {
        return {
            _id: group._id?.toString() || '',
            name: group.name,
            description: group.description,
            category: group.category || 'general', // Default to 'general' if not set
            members: group.members.map(member => ({
                userId: member.userId?.toString() || '',
                username: member.username || '',
                role: member.role,
                joinedAt: member.joinedAt?.toISOString() || new Date().toISOString()
            })),
            admins: group.admins?.map(id => id?.toString()).filter(Boolean) || [],
            isActive: group.isActive,
            status: group.status || 'active', // Default to 'active' if not set
            isPrivate: group.isPrivate,
            maxMembers: group.maxMembers,
            createdAt: group.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: group.updatedAt?.toISOString() || new Date().toISOString(),
            createdBy: group.createdBy?.toString() || '',
            avatar: group.avatar,
            tags: group.tags,
            rules: group.rules,
            memberCount: group.members?.length || 0
        };
    }

    static toCreate(data: IGroupCreate): Omit<IGroup, '_id' | 'createdAt' | 'updatedAt'> {
        return {
            name: data.name,
            description: data.description,
            status: data.status || 'active',
            isPrivate: data.isPrivate || false,
            maxMembers: data.maxMembers,
            createdBy: data.createdBy,
            avatar: data.avatar,
            tags: data.tags,
            rules: data.rules,
            isActive: true,
            members: [],
            admins: [data.createdBy]
        };
    }

    static toUpdate(data: IGroupUpdate): Partial<IGroup> {
        const update: Partial<IGroup> = {};

        if (data.name !== undefined) update.name = data.name;
        if (data.description !== undefined) update.description = data.description;
        if (data.status !== undefined) update.status = data.status;
        if (data.isPrivate !== undefined) update.isPrivate = data.isPrivate;
        if (data.maxMembers !== undefined) update.maxMembers = data.maxMembers;
        if (data.avatar !== undefined) update.avatar = data.avatar;
        if (data.tags !== undefined) update.tags = data.tags;
        if (data.rules !== undefined) update.rules = data.rules;
        if (data.isActive !== undefined) update.isActive = data.isActive;

        update.updatedAt = new Date();

        return update;
    }
}

export { IGroup as Group };