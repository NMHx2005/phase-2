import { ObjectId, Document } from 'mongodb';

export interface IChannel extends Document {
    _id?: ObjectId;
    name: string;
    description: string;
    groupId: ObjectId;
    type: 'text' | 'voice' | 'video';
    isActive: boolean;
    isPrivate: boolean;
    members: ObjectId[];
    admins: ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    createdBy: ObjectId;
    lastMessage?: {
        messageId: ObjectId;
        userId: ObjectId;
        username: string;
        text: string;
        timestamp: Date;
    };
    maxMembers?: number;
    settings?: {
        slowMode?: number;
        requireApproval?: boolean;
        allowReactions?: boolean;
        allowPolls?: boolean;
        allowFileUploads?: boolean;
        allowImageUploads?: boolean;
        allowVideoUploads?: boolean;
        maxFileSize?: number;
        allowedFileTypes?: string[];
    };
}

export interface IChannelCreate {
    name: string;
    description: string;
    groupId: ObjectId;
    type: 'text' | 'voice' | 'video';
    isPrivate?: boolean;
    createdBy: ObjectId;
    settings?: {
        allowFileUploads?: boolean;
        allowImageUploads?: boolean;
        allowVideoUploads?: boolean;
        maxFileSize?: number;
        allowedFileTypes?: string[];
    };
}

export interface IChannelUpdate {
    name?: string;
    description?: string;
    groupId?: ObjectId; // Add groupId to update interface
    type?: 'text' | 'voice' | 'video';
    isPrivate?: boolean;
    isActive?: boolean;
    maxMembers?: number; // Add maxMembers to update interface
    settings?: {
        slowMode?: number;
        requireApproval?: boolean;
        allowReactions?: boolean;
        allowPolls?: boolean;
        allowFileUploads?: boolean;
        allowImageUploads?: boolean;
        allowVideoUploads?: boolean;
        maxFileSize?: number;
        allowedFileTypes?: string[];
    };
}

export interface IChannelResponse {
    _id: string;
    name: string;
    description: string;
    groupId: string;
    type: 'text' | 'voice' | 'video';
    isActive: boolean;
    isPrivate: boolean;
    members: string[];
    admins: string[];
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    lastMessage?: {
        messageId: string;
        userId: string;
        username: string;
        text: string;
        timestamp: string;
    };
    maxMembers?: number;
    settings?: {
        slowMode?: number;
        requireApproval?: boolean;
        allowReactions?: boolean;
        allowPolls?: boolean;
        allowFileUploads?: boolean;
        allowImageUploads?: boolean;
        allowVideoUploads?: boolean;
        maxFileSize?: number;
        allowedFileTypes?: string[];
    };
    memberCount: number;
}

export class ChannelModel {
    static toResponse(channel: IChannel): IChannelResponse {
        return {
            _id: channel._id?.toString() || '',
            name: channel.name,
            description: channel.description,
            groupId: channel.groupId.toString(),
            type: channel.type,
            isActive: channel.isActive,
            isPrivate: channel.isPrivate,
            members: channel.members?.map(id => id.toString()) || [],
            admins: channel.admins?.map(id => id.toString()) || [],
            createdAt: channel.createdAt.toISOString(),
            updatedAt: channel.updatedAt.toISOString(),
            createdBy: channel.createdBy.toString(),
            lastMessage: channel.lastMessage ? {
                messageId: channel.lastMessage.messageId.toString(),
                userId: channel.lastMessage.userId.toString(),
                username: channel.lastMessage.username,
                text: channel.lastMessage.text,
                timestamp: channel.lastMessage.timestamp.toISOString()
            } : undefined,
            maxMembers: channel.maxMembers,
            settings: channel.settings,
            memberCount: channel.members?.length || 0
        };
    }

    static toCreate(data: IChannelCreate): Omit<IChannel, '_id' | 'createdAt' | 'updatedAt' | 'members' | 'admins' | 'lastMessage'> {
        return {
            name: data.name,
            description: data.description,
            groupId: data.groupId,
            type: data.type,
            isPrivate: data.isPrivate || false,
            isActive: true,
            createdBy: data.createdBy,
            settings: {
                allowFileUploads: data.settings?.allowFileUploads ?? true,
                allowImageUploads: data.settings?.allowImageUploads ?? true,
                allowVideoUploads: data.settings?.allowVideoUploads ?? true,
                maxFileSize: data.settings?.maxFileSize ?? 10 * 1024 * 1024, // 10MB
                allowedFileTypes: data.settings?.allowedFileTypes ?? ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf']
            }
        };
    }

    static toUpdate(data: IChannelUpdate): Partial<IChannel> {
        const update: Partial<IChannel> = {};

        if (data.name !== undefined) update.name = data.name;
        if (data.description !== undefined) update.description = data.description;
        if (data.groupId !== undefined) update.groupId = data.groupId;
        if (data.type !== undefined) update.type = data.type;
        if (data.isPrivate !== undefined) update.isPrivate = data.isPrivate;
        if (data.isActive !== undefined) update.isActive = data.isActive;
        if (data.maxMembers !== undefined) (update as any).maxMembers = data.maxMembers;

        if (data.settings !== undefined) {
            // Handle new settings structure
            update.settings = {
                slowMode: data.settings.slowMode ?? 0,
                requireApproval: data.settings.requireApproval ?? false,
                allowReactions: data.settings.allowReactions ?? true,
                allowPolls: data.settings.allowPolls ?? true,
                allowFileUploads: data.settings.allowFileUploads ?? true,
                allowImageUploads: data.settings.allowImageUploads ?? true,
                allowVideoUploads: data.settings.allowVideoUploads ?? true,
                maxFileSize: data.settings.maxFileSize ?? 10 * 1024 * 1024,
                allowedFileTypes: data.settings.allowedFileTypes ?? ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf']
            };
        }

        update.updatedAt = new Date();

        return update;
    }
}

export { IChannel as Channel };