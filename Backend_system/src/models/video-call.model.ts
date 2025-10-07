import { ObjectId, Document } from 'mongodb';

export interface IVideoCall extends Document {
    _id?: ObjectId;
    callerId: ObjectId;
    callerName: string;
    receiverId: ObjectId;
    receiverName: string;
    channelId?: ObjectId;
    status: 'calling' | 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
    startTime: Date;
    endTime?: Date;
    duration?: number; // in seconds
    createdAt: Date;
    updatedAt: Date;
    callType: 'video' | 'audio';
    quality?: {
        video: 'low' | 'medium' | 'high';
        audio: 'low' | 'medium' | 'high';
    };
    recording?: {
        enabled: boolean;
        url?: string;
        duration?: number;
    };
}

export interface IVideoCallCreate {
    callerId: ObjectId;
    callerName: string;
    receiverId: ObjectId;
    receiverName: string;
    channelId?: ObjectId;
    callType?: 'video' | 'audio';
    quality?: {
        video: 'low' | 'medium' | 'high';
        audio: 'low' | 'medium' | 'high';
    };
}

export interface IVideoCallUpdate {
    status?: 'calling' | 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
    endTime?: Date;
    duration?: number;
    quality?: {
        video: 'low' | 'medium' | 'high';
        audio: 'low' | 'medium' | 'high';
    };
    recording?: {
        enabled: boolean;
        url?: string;
        duration?: number;
    };
}

export interface IVideoCallResponse {
    _id: string;
    callerId: string;
    callerName: string;
    receiverId: string;
    receiverName: string;
    channelId?: string;
    status: 'calling' | 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
    startTime: string;
    endTime?: string;
    duration?: number;
    createdAt: string;
    updatedAt: string;
    callType: 'video' | 'audio';
    quality?: {
        video: 'low' | 'medium' | 'high';
        audio: 'low' | 'medium' | 'high';
    };
    recording?: {
        enabled: boolean;
        url?: string;
        duration?: number;
    };
}

export class VideoCallModel {
    static toResponse(call: IVideoCall): IVideoCallResponse {
        return {
            _id: call._id?.toString() || '',
            callerId: call.callerId.toString(),
            callerName: call.callerName,
            receiverId: call.receiverId.toString(),
            receiverName: call.receiverName,
            channelId: call.channelId?.toString(),
            status: call.status,
            startTime: call.startTime.toISOString(),
            endTime: call.endTime?.toISOString(),
            duration: call.duration,
            createdAt: call.createdAt.toISOString(),
            updatedAt: call.updatedAt.toISOString(),
            callType: call.callType,
            quality: call.quality,
            recording: call.recording
        };
    }

    static toCreate(data: IVideoCallCreate): Omit<IVideoCall, '_id' | 'createdAt' | 'updatedAt'> {
        return {
            callerId: data.callerId,
            callerName: data.callerName,
            receiverId: data.receiverId,
            receiverName: data.receiverName,
            channelId: data.channelId,
            status: 'calling',
            startTime: new Date(),
            callType: data.callType || 'video',
            quality: data.quality || {
                video: 'medium',
                audio: 'medium'
            }
        };
    }

    static toUpdate(data: IVideoCallUpdate): Partial<IVideoCall> {
        const update: Partial<IVideoCall> = {};

        if (data.status !== undefined) update.status = data.status;
        if (data.endTime !== undefined) update.endTime = data.endTime;
        if (data.duration !== undefined) update.duration = data.duration;
        if (data.quality !== undefined) update.quality = data.quality;
        if (data.recording !== undefined) update.recording = data.recording;

        update.updatedAt = new Date();

        return update;
    }

    static calculateDuration(startTime: Date, endTime: Date): number {
        return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    }
}

export { IVideoCall as VideoCall };