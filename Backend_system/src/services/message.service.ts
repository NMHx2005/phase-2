import { Collection, ObjectId, Document } from 'mongodb';
import { mongoDB } from '../db/mongodb';
import { IMessage, IMessageCreate, IMessageUpdate, IMessageResponse, MessageModel } from '../models/message.model';

export class MessageService {
    private collection: Collection<IMessage> | null = null;

    constructor() {
        // Lazy initialization - will be set when first method is called
    }

    private getCollection(): Collection<IMessage> {
        if (!this.collection) {
            this.collection = mongoDB.getCollection<IMessage>('messages');
        }
        return this.collection;
    }

    async create(messageData: IMessageCreate): Promise<IMessageResponse> {
        try {
            const message = MessageModel.toCreate(messageData);
            const result = await this.getCollection().insertOne({
                ...message,
                createdAt: new Date(),
                updatedAt: new Date()
            } as IMessage);

            const createdMessage = await this.getCollection().findOne({ _id: result.insertedId });
            if (!createdMessage) {
                throw new Error('Failed to create message');
            }

            return MessageModel.toResponse(createdMessage);
        } catch (error) {
            console.error('Error creating message:', error);
            throw error;
        }
    }

    async findByChannelId(channelId: string, page = 1, limit = 50): Promise<{
        messages: IMessageResponse[];
        total: number;
        page: number;
        pages: number;
    }> {
        try {
            const skip = (page - 1) * limit;
            const filter = {
                channelId: new ObjectId(channelId),
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ]
            };

            const [messages, total] = await Promise.all([
                this.getCollection()
                    .find(filter)
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .toArray(),
                this.getCollection().countDocuments(filter)
            ]);

            return {
                messages: messages.reverse().map(message => MessageModel.toResponse(message)),
                total,
                page,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error finding messages by channel ID:', error);
            throw error;
        }
    }

    async findById(id: string): Promise<IMessageResponse | null> {
        try {
            const message = await this.getCollection().findOne({ _id: new ObjectId(id) });
            return message ? MessageModel.toResponse(message) : null;
        } catch (error) {
            console.error('Error finding message by ID:', error);
            throw error;
        }
    }

    async update(id: string, messageData: IMessageUpdate): Promise<IMessageResponse | null> {
        try {
            const updateData = MessageModel.toUpdate(messageData);

            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );

            return result ? MessageModel.toResponse(result) : null;
        } catch (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }

    async hardDelete(id: string): Promise<boolean> {
        try {
            const result = await this.getCollection().deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error hard deleting message:', error);
            throw error;
        }
    }

    async editMessage(id: string, newText: string): Promise<IMessageResponse | null> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        text: newText,
                        isEdited: true,
                        editedAt: new Date(),
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            return result ? MessageModel.toResponse(result) : null;
        } catch (error) {
            console.error('Error editing message:', error);
            throw error;
        }
    }

    async addReaction(messageId: string, userId: string, username: string, emoji: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(messageId) },
                {
                    $addToSet: {
                        reactions: {
                            userId: new ObjectId(userId),
                            username,
                            emoji,
                            createdAt: new Date()
                        }
                    },
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error adding reaction:', error);
            throw error;
        }
    }

    async removeReaction(messageId: string, userId: string, emoji: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(messageId) },
                {
                    $pull: {
                        reactions: {
                            userId: new ObjectId(userId),
                            emoji
                        }
                    } as any,
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error removing reaction:', error);
            throw error;
        }
    }


    async getRecentMessages(channelId: string, limit = 10): Promise<IMessageResponse[]> {
        try {
            const messages = await this.getCollection()
                .find({
                    channelId: new ObjectId(channelId),
                    $or: [
                        { isDeleted: { $ne: true } },
                        { isDeleted: { $exists: false } }
                    ]
                })
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();

            return messages.reverse().map(message => MessageModel.toResponse(message));
        } catch (error) {
            console.error('Error getting recent messages:', error);
            throw error;
        }
    }

    async getMessageCount(channelId: string): Promise<number> {
        try {
            return await this.getCollection().countDocuments({
                channelId: new ObjectId(channelId),
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ]
            });
        } catch (error) {
            console.error('Error getting message count:', error);
            throw error;
        }
    }

    async getUserMessages(userId: string, page = 1, limit = 20): Promise<{
        messages: IMessageResponse[];
        total: number;
        page: number;
        pages: number;
    }> {
        try {
            const skip = (page - 1) * limit;
            const filter = {
                userId: new ObjectId(userId),
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ]
            };

            const [messages, total] = await Promise.all([
                this.getCollection()
                    .find(filter)
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .toArray(),
                this.getCollection().countDocuments(filter)
            ]);

            return {
                messages: messages.map(message => MessageModel.toResponse(message)),
                total,
                page,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error getting user messages:', error);
            throw error;
        }
    }

    // Admin methods
    async countMessages(): Promise<number> {
        try {
            // Count all messages, excluding only those explicitly marked as deleted
            return await this.getCollection().countDocuments({
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ]
            });
        } catch (error) {
            console.error('Error counting messages:', error);
            throw error;
        }
    }

    async countMessagesToday(): Promise<number> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            return await this.getCollection().countDocuments({
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ],
                createdAt: { $gte: today, $lt: tomorrow }
            });
        } catch (error) {
            console.error('Error counting messages today:', error);
            throw error;
        }
    }

    async countMessagesThisWeek(): Promise<number> {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            return await this.getCollection().countDocuments({
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ],
                createdAt: { $gte: oneWeekAgo }
            });
        } catch (error) {
            console.error('Error counting messages this week:', error);
            throw error;
        }
    }

    // Additional methods for controllers
    async getMessagesByChannel(channelId: string, limit: number, offset: number): Promise<IMessageResponse[]> {
        try {
            console.log('🔍 MessageService.getMessagesByChannel - Channel ID:', channelId);

            const filter = {
                channelId: new ObjectId(channelId),
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ]
            };

            console.log('🔍 MessageService.getMessagesByChannel - Filter:', JSON.stringify(filter));

            const messages = await this.getCollection()
                .find(filter)
                .skip(offset)
                .limit(limit)
                .sort({ createdAt: -1 })
                .toArray();

            console.log('🔍 MessageService.getMessagesByChannel - Raw messages found:', messages.length);
            console.log('🔍 MessageService.getMessagesByChannel - Raw messages:', messages.map(m => ({
                _id: m._id,
                channelId: m.channelId,
                userId: m.userId,
                username: m.username,
                text: m.text,
                type: m.type
            })));

            return messages.reverse().map(message => MessageModel.toResponse(message));
        } catch (error) {
            console.error('Error getting messages by channel:', error);
            throw error;
        }
    }

    async getMessagesByUser(userId: string, limit: number, offset: number): Promise<IMessageResponse[]> {
        try {
            const messages = await this.getCollection()
                .find({
                    userId: new ObjectId(userId),
                    $or: [
                        { isDeleted: { $ne: true } },
                        { isDeleted: { $exists: false } }
                    ]
                })
                .skip(offset)
                .limit(limit)
                .sort({ createdAt: -1 })
                .toArray();

            return messages.map(message => MessageModel.toResponse(message));
        } catch (error) {
            console.error('Error getting messages by user:', error);
            throw error;
        }
    }

    async searchMessages(options: {
        query: string;
        channelId?: string;
        userId?: string;
        limit: number;
        offset: number;
    }): Promise<IMessageResponse[]> {
        try {
            const filter: any = {
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ],
                $text: { $search: options.query }
            };

            if (options.channelId) {
                filter.channelId = new ObjectId(options.channelId);
            }

            if (options.userId) {
                filter.userId = new ObjectId(options.userId);
            }

            const messages = await this.getCollection()
                .find(filter)
                .skip(options.offset)
                .limit(options.limit)
                .sort({ createdAt: -1 })
                .toArray();

            return messages.map(message => MessageModel.toResponse(message));
        } catch (error) {
            console.error('Error searching messages:', error);
            throw error;
        }
    }

    async getMessageById(id: string): Promise<IMessageResponse | null> {
        try {
            const message = await this.getCollection().findOne({
                _id: new ObjectId(id),
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ]
            });

            return message ? MessageModel.toResponse(message) : null;
        } catch (error) {
            console.error('Error getting message by ID:', error);
            throw error;
        }
    }

    async createMessage(messageData: IMessageCreate): Promise<IMessageResponse> {
        return this.create(messageData);
    }

    async updateMessage(id: string, updateData: IMessageUpdate): Promise<IMessageResponse | null> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id), isDeleted: false },
                {
                    $set: {
                        ...updateData,
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            return result ? MessageModel.toResponse(result) : null;
        } catch (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    }

    async deleteMessage(id: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }
}

export const messageService = new MessageService();