import { MessageReaction, IMessageReaction } from '../models/message-reaction.model';
import { MessageModel as Message } from '../models/message.model';
import { ApiResponse } from '../types/api-response.type.js';
import { mongoDB } from '../db/mongodb';

export class MessageReactionService {
    /**
     * Add or update a reaction to a message
     */
    async addReaction(messageId: string, userId: string, reaction: string): Promise<ApiResponse<any>> {
        try {
            const { ObjectId } = require('mongodb');
            const messageObjectId = new ObjectId(messageId);
            const userObjectId = new ObjectId(userId);

            // Check if message exists
            const db = mongoDB.getDatabase();
            const messageCollection = db.collection('messages');
            const message = await messageCollection.findOne({ _id: messageObjectId });
            if (!message) {
                return {
                    success: false,
                    message: 'Message not found',
                    statusCode: 404
                };
            }

            // Check if user already reacted to this message
            const existingReaction = await MessageReaction.findByUserAndMessage(messageObjectId, userObjectId);

            if (existingReaction) {
                // Update existing reaction
                const updatedReaction = await MessageReaction.updateById(existingReaction._id!, { reaction });

                return {
                    success: true,
                    message: 'Reaction updated successfully',
                    data: updatedReaction,
                    statusCode: 200
                };
            } else {
                // Create new reaction
                const newReaction = await MessageReaction.create({
                    messageId: messageObjectId,
                    userId: userObjectId,
                    reaction
                });

                return {
                    success: true,
                    message: 'Reaction added successfully',
                    data: newReaction,
                    statusCode: 201
                };
            }
        } catch (error) {
            console.error('Error adding reaction:', error);
            return {
                success: false,
                message: 'Failed to add reaction',
                statusCode: 500
            };
        }
    }

    /**
     * Remove a reaction from a message
     */
    async removeReaction(messageId: string, userId: string): Promise<ApiResponse<any>> {
        try {
            const { ObjectId } = require('mongodb');
            const messageObjectId = new ObjectId(messageId);
            const userObjectId = new ObjectId(userId);

            const reaction = await MessageReaction.findByUserAndMessage(messageObjectId, userObjectId);

            if (!reaction) {
                return {
                    success: false,
                    message: 'Reaction not found',
                    statusCode: 404
                };
            }

            const deleted = await MessageReaction.deleteByUserAndMessage(messageObjectId, userObjectId);

            return {
                success: true,
                message: 'Reaction removed successfully',
                data: reaction,
                statusCode: 200
            };
        } catch (error) {
            console.error('Error removing reaction:', error);
            return {
                success: false,
                message: 'Failed to remove reaction',
                statusCode: 500
            };
        }
    }

    /**
     * Get all reactions for a message
     */
    async getMessageReactions(messageId: string): Promise<ApiResponse<any>> {
        try {
            const { ObjectId } = require('mongodb');
            const messageObjectId = new ObjectId(messageId);

            const reactions = await MessageReaction.findByMessageId(messageObjectId);
            const reactionCounts = await MessageReaction.getReactionCounts(messageObjectId);
            const userReactions = await MessageReaction.getUserReactions(messageObjectId);

            return {
                success: true,
                message: 'Reactions retrieved successfully',
                data: {
                    reactions,
                    reactionCounts,
                    userReactions,
                    totalReactions: reactions.length
                },
                statusCode: 200
            };
        } catch (error) {
            console.error('Error getting message reactions:', error);
            return {
                success: false,
                message: 'Failed to get reactions',
                statusCode: 500
            };
        }
    }

    /**
     * Get reactions for multiple messages
     */
    async getMultipleMessageReactions(messageIds: string[]): Promise<ApiResponse<any>> {
        try {
            const { ObjectId } = require('mongodb');
            const messageObjectIds = messageIds.map(id => new ObjectId(id));

            const db = mongoDB.getDatabase();
            const collection = db.collection(MessageReaction.collectionName);
            const reactions = await collection.find({
                messageId: { $in: messageObjectIds }
            }).toArray();

            // Group by messageId
            const messageReactions: { [key: string]: any } = {};

            messageIds.forEach(messageId => {
                messageReactions[messageId] = {
                    reactions: [],
                    reactionCounts: {},
                    userReactions: {},
                    totalReactions: 0
                };
            });

            reactions.forEach((reaction: any) => {
                const messageId = reaction.messageId;

                if (!messageReactions[messageId]) {
                    messageReactions[messageId] = {
                        reactions: [],
                        reactionCounts: {},
                        userReactions: {},
                        totalReactions: 0
                    };
                }

                messageReactions[messageId].reactions.push(reaction);

                // Count reactions
                if (!messageReactions[messageId].reactionCounts[reaction.reaction]) {
                    messageReactions[messageId].reactionCounts[reaction.reaction] = 0;
                }
                messageReactions[messageId].reactionCounts[reaction.reaction]++;

                // Track user reactions
                if (!messageReactions[messageId].userReactions[reaction.reaction]) {
                    messageReactions[messageId].userReactions[reaction.reaction] = [];
                }
                messageReactions[messageId].userReactions[reaction.reaction].push(reaction.userId);

                messageReactions[messageId].totalReactions++;
            });

            return {
                success: true,
                message: 'Multiple message reactions retrieved successfully',
                data: messageReactions,
                statusCode: 200
            };
        } catch (error) {
            console.error('Error getting multiple message reactions:', error);
            return {
                success: false,
                message: 'Failed to get reactions',
                statusCode: 500
            };
        }
    }

    /**
     * Check if user has reacted to a message
     */
    async hasUserReacted(messageId: string, userId: string): Promise<ApiResponse<any>> {
        try {
            const { ObjectId } = require('mongodb');
            const messageObjectId = new ObjectId(messageId);
            const userObjectId = new ObjectId(userId);

            const reaction = await MessageReaction.findByUserAndMessage(messageObjectId, userObjectId);

            return {
                success: true,
                message: 'User reaction status retrieved',
                data: {
                    hasReacted: !!reaction,
                    reaction: reaction?.reaction || null
                },
                statusCode: 200
            };
        } catch (error) {
            console.error('Error checking user reaction:', error);
            return {
                success: false,
                message: 'Failed to check user reaction',
                statusCode: 500
            };
        }
    }
}
