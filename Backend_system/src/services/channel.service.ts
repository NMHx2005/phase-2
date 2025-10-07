import { Collection, ObjectId } from 'mongodb';
import { mongoDB } from '../db/mongodb';
import { IChannel, IChannelCreate, IChannelUpdate, IChannelResponse, ChannelModel } from '../models/channel.model';

export class ChannelService {
    private collection: Collection<IChannel> | null = null;

    constructor() {
        // Lazy initialization - will be set when first method is called
    }

    private getCollection(): Collection<IChannel> {
        if (!this.collection) {
            this.collection = mongoDB.getCollection<IChannel>('channels');
        }
        return this.collection;
    }

    // Get all channels
    async getAllChannels(): Promise<IChannelResponse[]> {
        try {
            const channels = await this.getCollection().find({}).toArray();
            return channels.map(channel => ChannelModel.toResponse(channel));
        } catch (error) {
            console.error('Error getting all channels:', error);
            throw error;
        }
    }

    // Get channels with pagination and filters
    async getChannelsPaginated(options: {
        page: number;
        limit: number;
        search?: string;
        groupId?: string;
        channelType?: string;
        isActive?: boolean;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<{
        channels: IChannelResponse[];
        total: number;
        page: number;
        pages: number;
        limit: number;
    }> {
        try {
            const { page, limit, search, groupId, channelType, isActive, sortBy, sortOrder } = options;
            const skip = (page - 1) * limit;

            // Build filter
            const filter: any = {};

            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            if (groupId) {
                if (!ObjectId.isValid(groupId)) {
                    throw new Error('Invalid group ID format');
                }
                filter.groupId = new ObjectId(groupId);
            }

            if (channelType) {
                filter.type = channelType;
            }

            if (isActive !== undefined) {
                filter.isActive = isActive;
            }

            // Build sort
            const sortField = sortBy || 'createdAt';
            const sortDirection = sortOrder === 'asc' ? 1 : -1;
            const sort: any = {};
            sort[sortField] = sortDirection;

            // Execute queries
            const [channels, total] = await Promise.all([
                this.getCollection()
                    .find(filter)
                    .skip(skip)
                    .limit(limit)
                    .sort(sort)
                    .toArray(),
                this.getCollection().countDocuments(filter)
            ]);

            return {
                channels: channels.map(channel => ChannelModel.toResponse(channel)),
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            };
        } catch (error) {
            console.error('Error getting channels with pagination:', error);
            throw error;
        }
    }

    // Get channel by ID
    async getChannelById(channelId: string): Promise<IChannelResponse | null> {
        try {
            // Validate ObjectId format
            if (!ObjectId.isValid(channelId)) {
                throw new Error('Invalid channel ID format');
            }

            const channel = await this.getCollection().findOne({ _id: new ObjectId(channelId) });
            return channel ? ChannelModel.toResponse(channel) : null;
        } catch (error) {
            console.error('Error getting channel by ID:', error);
            throw error;
        }
    }

    // Get channels by group ID
    async getChannelsByGroup(groupId: string): Promise<IChannelResponse[]> {
        try {
            // Validate ObjectId format
            if (!ObjectId.isValid(groupId)) {
                throw new Error('Invalid group ID format');
            }

            const channels = await this.getCollection().find({ groupId: new ObjectId(groupId) }).toArray();
            return channels.map(channel => ChannelModel.toResponse(channel));
        } catch (error) {
            console.error('Error getting channels by group:', error);
            throw error;
        }
    }

    // Create new channel
    async createChannel(channelData: IChannelCreate): Promise<IChannelResponse> {
        try {
            const channel = ChannelModel.toCreate(channelData);
            const result = await this.getCollection().insertOne({
                ...channel,
                createdAt: new Date(),
                updatedAt: new Date()
            } as IChannel);

            const createdChannel = await this.getCollection().findOne({ _id: result.insertedId });
            if (!createdChannel) {
                throw new Error('Failed to create channel');
            }

            return ChannelModel.toResponse(createdChannel);
        } catch (error) {
            console.error('Error creating channel:', error);
            throw error;
        }
    }

    // Update channel
    async updateChannel(channelId: string, updateData: IChannelUpdate): Promise<IChannelResponse | null> {
        try {
            const update = ChannelModel.toUpdate(updateData);
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(channelId) },
                { $set: update },
                { returnDocument: 'after' }
            );

            return result ? ChannelModel.toResponse(result) : null;
        } catch (error) {
            console.error('Error updating channel:', error);
            throw error;
        }
    }

    // Delete channel
    async deleteChannel(channelId: string): Promise<boolean> {
        try {
            const result = await this.getCollection().deleteOne({ _id: new ObjectId(channelId) });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting channel:', error);
            throw error;
        }
    }

    // Add member to channel
    async addMember(channelId: string, userId: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(channelId) },
                {
                    $addToSet: { members: new ObjectId(userId) },
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error adding member to channel:', error);
            throw error;
        }
    }

    // Remove member from channel
    async removeMember(channelId: string, userId: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(channelId) },
                {
                    $pull: { members: new ObjectId(userId) } as any,
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error removing member from channel:', error);
            throw error;
        }
    }

    // Add admin to channel
    async addAdmin(channelId: string, userId: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(channelId) },
                {
                    $addToSet: { admins: new ObjectId(userId) },
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error adding admin to channel:', error);
            throw error;
        }
    }

    // Remove admin from channel
    async removeAdmin(channelId: string, userId: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(channelId) },
                {
                    $pull: { admins: new ObjectId(userId) } as any,
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error removing admin from channel:', error);
            throw error;
        }
    }

    // Check if user is member of channel
    async isMember(channelId: string, userId: string): Promise<boolean> {
        try {
            const channel = await this.getCollection().findOne({
                _id: new ObjectId(channelId),
                members: new ObjectId(userId)
            });
            return !!channel;
        } catch (error) {
            console.error('Error checking channel membership:', error);
            throw error;
        }
    }

    // Check if user is admin of channel
    async isAdmin(channelId: string, userId: string): Promise<boolean> {
        try {
            const channel = await this.getCollection().findOne({
                _id: new ObjectId(channelId),
                admins: new ObjectId(userId)
            });
            return !!channel;
        } catch (error) {
            console.error('Error checking channel admin status:', error);
            throw error;
        }
    }

    // Get channel members
    async getChannelMembers(channelId: string): Promise<ObjectId[]> {
        try {
            const channel = await this.getCollection().findOne({ _id: new ObjectId(channelId) });
            return channel?.members || [];
        } catch (error) {
            console.error('Error getting channel members:', error);
            throw error;
        }
    }

    // Get channel admins
    async getChannelAdmins(channelId: string): Promise<ObjectId[]> {
        try {
            const channel = await this.getCollection().findOne({ _id: new ObjectId(channelId) });
            return channel?.admins || [];
        } catch (error) {
            console.error('Error getting channel admins:', error);
            throw error;
        }
    }

    // Update last message
    async updateLastMessage(channelId: string, messageData: {
        messageId: string;
        userId: string;
        username: string;
        text: string;
        timestamp: Date;
    }): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(channelId) },
                {
                    $set: {
                        lastMessage: {
                            messageId: new ObjectId(messageData.messageId),
                            userId: new ObjectId(messageData.userId),
                            username: messageData.username,
                            text: messageData.text,
                            timestamp: messageData.timestamp
                        },
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error updating last message:', error);
            throw error;
        }
    }

    // Admin methods
    async countChannels(): Promise<number> {
        try {
            // Count all channels, excluding only those explicitly marked as deleted
            return await this.getCollection().countDocuments({
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ]
            });
        } catch (error) {
            console.error('Error counting channels:', error);
            throw error;
        }
    }

    async countActiveChannels(): Promise<number> {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            return await this.getCollection().countDocuments({
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ],
                isActive: true,
                updatedAt: { $gte: oneWeekAgo }
            });
        } catch (error) {
            console.error('Error counting active channels:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const channelService = new ChannelService();