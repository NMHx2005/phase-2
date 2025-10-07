import { MessageReply, IMessageReply } from '../models/message-reply.model';
import { MessageModel as Message } from '../models/message.model';
import { ApiResponse } from '../types/api-response.type';
import { mongoDB } from '../db/mongodb';

export class MessageReplyService {
    /**
     * Create a reply to a message
     */
    async createReply(
        originalMessageId: string,
        channelId: string,
        userId: string,
        username: string,
        text: string,
        type: 'text' | 'image' | 'file' = 'text',
        imageUrl?: string,
        fileUrl?: string,
        fileName?: string,
        fileSize?: number
    ): Promise<ApiResponse<any>> {
        try {
            const { ObjectId } = require('mongodb');
            const originalMessageObjectId = new ObjectId(originalMessageId);
            const channelObjectId = new ObjectId(channelId);
            const userObjectId = new ObjectId(userId);

            // Check if original message exists
            const db = mongoDB.getDatabase();
            const messageCollection = db.collection('messages');
            const originalMessage = await messageCollection.findOne({ _id: originalMessageObjectId });
            if (!originalMessage) {
                return {
                    success: false,
                    message: 'Original message not found',
                    statusCode: 404
                };
            }

            // Create the reply message first
            const replyMessageData = {
                _id: new ObjectId(),
                channelId: channelObjectId,
                userId: userObjectId,
                username,
                text,
                type,
                imageUrl,
                fileUrl,
                fileName,
                fileSize,
                isReply: true,
                originalMessageId: originalMessageObjectId,
                isEdited: false,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            await messageCollection.insertOne(replyMessageData);

            // Create the reply relationship
            const messageReply = await MessageReply.create({
                originalMessageId: originalMessageObjectId,
                replyMessageId: replyMessageData._id,
                channelId: channelObjectId,
                userId: userObjectId,
                username,
                text,
                type,
                imageUrl,
                fileUrl,
                fileName,
                fileSize
            });

            return {
                success: true,
                message: 'Reply created successfully',
                data: {
                    reply: messageReply,
                    message: replyMessageData
                },
                statusCode: 201
            };
        } catch (error) {
            console.error('Error creating reply:', error);
            return {
                success: false,
                message: 'Failed to create reply',
                statusCode: 500
            };
        }
    }

    /**
     * Get all replies for a message
     */
    async getMessageReplies(messageId: string, page: number = 1, limit: number = 20): Promise<ApiResponse<any>> {
        try {
            const { ObjectId } = require('mongodb');
            const messageObjectId = new ObjectId(messageId);

            const replies = await MessageReply.findByOriginalMessageId(messageObjectId, page, limit);
            const totalReplies = await MessageReply.countByOriginalMessageId(messageObjectId);

            return {
                success: true,
                message: 'Replies retrieved successfully',
                data: {
                    replies,
                    pagination: {
                        page,
                        limit,
                        total: totalReplies,
                        pages: Math.ceil(totalReplies / limit)
                    }
                },
                statusCode: 200
            };
        } catch (error) {
            console.error('Error getting message replies:', error);
            return {
                success: false,
                message: 'Failed to get replies',
                statusCode: 500
            };
        }
    }

    /**
     * Get reply count for a message
     */
    async getReplyCount(messageId: string): Promise<ApiResponse<any>> {
        try {
            const { ObjectId } = require('mongodb');
            const messageObjectId = new ObjectId(messageId);

            const count = await MessageReply.countByOriginalMessageId(messageObjectId);

            return {
                success: true,
                message: 'Reply count retrieved successfully',
                data: { count },
                statusCode: 200
            };
        } catch (error) {
            console.error('Error getting reply count:', error);
            return {
                success: false,
                message: 'Failed to get reply count',
                statusCode: 500
            };
        }
    }

    /**
     * Get replies for multiple messages
     */
    async getMultipleMessageReplies(messageIds: string[]): Promise<ApiResponse<any>> {
        try {
            const { ObjectId } = require('mongodb');
            const messageObjectIds = messageIds.map(id => new ObjectId(id));

            const repliesMap = await MessageReply.getMultipleMessageReplies(messageObjectIds);
            const replies = Object.values(repliesMap).flat();

            // Group by originalMessageId
            const messageReplies: { [key: string]: any[] } = {};

            messageIds.forEach(messageId => {
                messageReplies[messageId] = [];
            });

            replies.forEach((reply: any) => {
                const originalMessageId = reply.originalMessageId.toString();
                if (!messageReplies[originalMessageId]) {
                    messageReplies[originalMessageId] = [];
                }
                messageReplies[originalMessageId].push(reply);
            });

            return {
                success: true,
                message: 'Multiple message replies retrieved successfully',
                data: messageReplies,
                statusCode: 200
            };
        } catch (error) {
            console.error('Error getting multiple message replies:', error);
            return {
                success: false,
                message: 'Failed to get replies',
                statusCode: 500
            };
        }
    }

    /**
     * Delete a reply
     */
    async deleteReply(replyId: string, userId: string): Promise<ApiResponse<any>> {
        try {
            const { ObjectId } = require('mongodb');
            const replyObjectId = new ObjectId(replyId);
            const userObjectId = new ObjectId(userId);

            const reply = await MessageReply.findById(replyObjectId);

            if (!reply) {
                return {
                    success: false,
                    message: 'Reply not found',
                    statusCode: 404
                };
            }

            // Check if user owns the reply
            if (reply.userId.toString() !== userObjectId.toString()) {
                return {
                    success: false,
                    message: 'Unauthorized to delete this reply',
                    statusCode: 403
                };
            }

            // Soft delete the reply
            await MessageReply.softDeleteById(replyObjectId);

            // Also soft delete the associated message
            const db = mongoDB.getDatabase();
            const messageCollection = db.collection('messages');
            await messageCollection.updateOne(
                { _id: reply.replyMessageId },
                {
                    $set: {
                        isDeleted: true,
                        updatedAt: new Date()
                    }
                }
            );

            return {
                success: true,
                message: 'Reply deleted successfully',
                data: reply,
                statusCode: 200
            };
        } catch (error) {
            console.error('Error deleting reply:', error);
            return {
                success: false,
                message: 'Failed to delete reply',
                statusCode: 500
            };
        }
    }
}
