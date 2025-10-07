import { Collection, ObjectId } from 'mongodb';
import { mongoDB } from '../db/mongodb';
import { IVideoCall, IVideoCallCreate, IVideoCallUpdate, IVideoCallResponse, VideoCallModel } from '../models/video-call.model';

// WebRTC types for signaling
interface RTCSessionDescriptionInit {
    type?: 'offer' | 'answer' | 'pranswer' | 'rollback';
    sdp?: string;
}

interface RTCIceCandidateInit {
    candidate?: string;
    sdpMLineIndex?: number | null;
    sdpMid?: string | null;
    usernameFragment?: string | null;
}

export interface CallOffer {
    callId: string;
    initiatorId: string;
    recipientId: string;
    channelId: string;
    offer: RTCSessionDescriptionInit;
}

export interface CallAnswer {
    callId: string;
    answer: RTCSessionDescriptionInit;
}

export interface IceCandidate {
    callId: string;
    candidate: RTCIceCandidateInit;
}

export class VideoCallService {
    private collection: Collection<IVideoCall> | null = null;

    constructor() {
        // Lazy initialization - collection will be initialized when first accessed
    }

    private getCollection(): Collection<IVideoCall> {
        if (!this.collection) {
            this.collection = mongoDB.getCollection<IVideoCall>('videoCalls');
        }
        return this.collection;
    }

    // Create a new video call
    async createCall(callData: IVideoCallCreate): Promise<IVideoCallResponse> {
        try {
            const call = VideoCallModel.toCreate(callData);
            const result = await this.getCollection().insertOne({
                ...call,
                createdAt: new Date(),
                updatedAt: new Date()
            } as IVideoCall);

            const createdCall = await this.getCollection().findOne({ _id: result.insertedId });
            if (!createdCall) {
                throw new Error('Failed to create video call');
            }

            return VideoCallModel.toResponse(createdCall);
        } catch (error) {
            console.error('Error creating video call:', error);
            throw error;
        }
    }

    // Update call status
    async updateCallStatus(callId: string, status: IVideoCall['status']): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { callId },
                {
                    $set: {
                        status,
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error updating call status:', error);
            throw error;
        }
    }

    // End call and update duration
    async endCall(callId: string, duration?: number): Promise<boolean> {
        try {
            const call = await this.getCollection().findOne({ callId });
            if (!call) {
                throw new Error('Call not found');
            }

            const endTime = new Date();
            const callDuration = duration || (endTime.getTime() - call.startTime.getTime()) / 1000;

            await this.getCollection().findOneAndUpdate(
                { callId },
                {
                    status: 'ended',
                    endTime,
                    duration: callDuration,
                    updatedAt: new Date()
                }
            );

            return true;
        } catch (error) {
            console.error('Error ending call:', error);
            throw error;
        }
    }

    // Get call by ID
    async getCallById(callId: string): Promise<IVideoCallResponse | null> {
        try {
            const call = await this.getCollection().findOne({ callId });
            return call ? VideoCallModel.toResponse(call) : null;
        } catch (error) {
            console.error('Error getting call by ID:', error);
            throw error;
        }
    }

    // Get calls by user
    async getCallsByUser(userId: string): Promise<IVideoCallResponse[]> {
        try {
            const calls = await this.getCollection().find({
                $or: [
                    { callerId: new ObjectId(userId) },
                    { receiverId: new ObjectId(userId) }
                ]
            }).toArray();

            return calls.map(call => VideoCallModel.toResponse(call));
        } catch (error) {
            console.error('Error getting calls by user:', error);
            throw error;
        }
    }

    // Get calls by channel
    async getCallsByChannel(channelId: string): Promise<IVideoCallResponse[]> {
        try {
            const calls = await this.getCollection().find({
                channelId: new ObjectId(channelId)
            }).toArray();

            return calls.map(call => VideoCallModel.toResponse(call));
        } catch (error) {
            console.error('Error getting calls by channel:', error);
            throw error;
        }
    }

    // Get call statistics
    async getCallStats(userId?: string): Promise<{
        totalCalls: number;
        acceptedCalls: number;
        rejectedCalls: number;
        missedCalls: number;
        totalDuration: number;
        averageDuration: number;
    }> {
        try {
            const filter = userId ? {
                $or: [
                    { callerId: new ObjectId(userId) },
                    { receiverId: new ObjectId(userId) }
                ]
            } : {};

            const calls = await this.getCollection().find(filter).toArray();

            const acceptedCalls = calls.filter(call => call.status === 'accepted').length;
            const rejectedCalls = calls.filter(call => call.status === 'rejected').length;
            const missedCalls = calls.filter(call => call.status === 'missed').length;

            const completedCalls = calls.filter(call => call.status === 'ended' && call.duration);
            const totalDuration = completedCalls.reduce((sum, call) => sum + (call.duration || 0), 0);

            return {
                totalCalls: calls.length,
                acceptedCalls,
                rejectedCalls,
                missedCalls,
                totalDuration,
                averageDuration: completedCalls.length > 0 ? totalDuration / completedCalls.length : 0
            };
        } catch (error) {
            console.error('Error getting call stats:', error);
            throw error;
        }
    }

    // Cleanup expired calls
    async cleanupExpiredCalls(): Promise<number> {
        try {
            const expiredCalls = await this.getCollection().find({
                status: { $in: ['calling', 'ringing'] },
                createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } // 30 minutes ago
            }).toArray();

            if (expiredCalls.length > 0) {
                const result = await this.getCollection().updateMany(
                    { _id: { $in: expiredCalls.map(call => call._id) } },
                    {
                        $set: {
                            status: 'missed',
                            updatedAt: new Date()
                        }
                    }
                );

                return result.modifiedCount;
            }

            return 0;
        } catch (error) {
            console.error('Error cleaning up expired calls:', error);
            throw error;
        }
    }

    // Get active calls
    async getActiveCalls(): Promise<IVideoCallResponse[]> {
        try {
            const calls = await this.getCollection().find({
                status: { $in: ['calling', 'ringing', 'accepted'] }
            }).toArray();

            return calls.map(call => VideoCallModel.toResponse(call));
        } catch (error) {
            console.error('Error getting active calls:', error);
            throw error;
        }
    }

    // Delete call
    async deleteCall(callId: string): Promise<boolean> {
        try {
            const result = await this.getCollection().deleteOne({ callId });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error deleting call:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const videoCallService = new VideoCallService();