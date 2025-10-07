import { ObjectId } from 'mongodb';
import { FakeUser } from './users.fake';
import { FakeChannel } from './channels.fake';

export interface FakeVideoCall {
    _id: ObjectId;
    callId: string;
    initiatorId: ObjectId;
    recipientId: ObjectId;
    channelId: ObjectId;
    status: 'initiated' | 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';
    startTime?: Date;
    endTime?: Date;
    duration?: number; // in seconds
    quality: {
        video: 'low' | 'medium' | 'high' | 'hd';
        audio: 'low' | 'medium' | 'high';
    };
    participants: {
        userId: ObjectId;
        joinedAt: Date;
        leftAt?: Date;
        isMuted: boolean;
        isVideoEnabled: boolean;
    }[];
    metadata: {
        deviceType: 'desktop' | 'mobile' | 'tablet';
        browser?: string;
        os?: string;
        networkType?: 'wifi' | 'ethernet' | 'cellular';
    };
    createdAt: Date;
    updatedAt: Date;
}

export const createFakeVideoCalls = (users: FakeUser[], channels: FakeChannel[]): FakeVideoCall[] => {
    const videoCalls: FakeVideoCall[] = [];
    const statuses: FakeVideoCall['status'][] = ['initiated', 'ringing', 'accepted', 'rejected', 'ended', 'missed'];
    const qualityLevels = ['low', 'medium', 'high', 'hd'] as const;
    const deviceTypes = ['desktop', 'mobile', 'tablet'] as const;
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'] as const;
    const osTypes = ['Windows', 'macOS', 'Linux', 'iOS', 'Android'] as const;
    const networkTypes = ['wifi', 'ethernet', 'cellular'] as const;

    // Generate 100+ video calls
    for (let i = 0; i < 150; i++) {
        const initiator = users[Math.floor(Math.random() * users.length)]!;
        let recipient = users[Math.floor(Math.random() * users.length)]!;

        // Ensure recipient is different from initiator
        while (recipient._id.equals(initiator._id)) {
            recipient = users[Math.floor(Math.random() * users.length)]!;
        }

        const channel = channels[Math.floor(Math.random() * channels.length)]!;
        const status = statuses[Math.floor(Math.random() * statuses.length)]!;

        const startTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const endTime = status === 'ended' ? new Date(startTime.getTime() + Math.random() * 2 * 60 * 60 * 1000) : undefined;
        const duration = endTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : undefined;

        const videoCall: FakeVideoCall = {
            _id: new ObjectId(),
            callId: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            initiatorId: initiator._id,
            recipientId: recipient._id,
            channelId: channel._id,
            status,
            startTime: status === 'accepted' || status === 'ended' ? startTime : undefined,
            endTime: status === 'ended' ? endTime : undefined,
            duration,
            quality: {
                video: qualityLevels[Math.floor(Math.random() * qualityLevels.length)]!,
                audio: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)]! // Exclude 'hd' for audio
            },
            participants: [
                {
                    userId: initiator._id,
                    joinedAt: startTime,
                    leftAt: endTime,
                    isMuted: Math.random() < 0.3,
                    isVideoEnabled: Math.random() < 0.8
                },
                {
                    userId: recipient._id,
                    joinedAt: status === 'accepted' || status === 'ended' ?
                        new Date(startTime.getTime() + Math.random() * 30 * 1000) : startTime,
                    leftAt: endTime,
                    isMuted: Math.random() < 0.2,
                    isVideoEnabled: Math.random() < 0.9
                }
            ],
            metadata: {
                deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)]!,
                browser: browsers[Math.floor(Math.random() * browsers.length)]!,
                os: osTypes[Math.floor(Math.random() * osTypes.length)]!,
                networkType: networkTypes[Math.floor(Math.random() * networkTypes.length)]!
            },
            createdAt: startTime,
            updatedAt: endTime || new Date()
        };

        videoCalls.push(videoCall);
    }

    return videoCalls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getRandomVideoCall = (videoCalls: FakeVideoCall[]): FakeVideoCall => {
    return videoCalls[Math.floor(Math.random() * videoCalls.length)]!;
};

export const getVideoCallsByUser = (videoCalls: FakeVideoCall[], userId: ObjectId): FakeVideoCall[] => {
    return videoCalls.filter(call =>
        call.initiatorId.equals(userId) || call.recipientId.equals(userId)
    );
};

export const getVideoCallsByChannel = (videoCalls: FakeVideoCall[], channelId: ObjectId): FakeVideoCall[] => {
    return videoCalls.filter(call => call.channelId.equals(channelId));
};

export const getVideoCallsByStatus = (videoCalls: FakeVideoCall[], status: FakeVideoCall['status']): FakeVideoCall[] => {
    return videoCalls.filter(call => call.status === status);
};

export const getActiveVideoCalls = (videoCalls: FakeVideoCall[]): FakeVideoCall[] => {
    return videoCalls.filter(call =>
        call.status === 'initiated' || call.status === 'ringing' || call.status === 'accepted'
    );
};

export const getCompletedVideoCalls = (videoCalls: FakeVideoCall[]): FakeVideoCall[] => {
    return videoCalls.filter(call =>
        call.status === 'ended' || call.status === 'rejected' || call.status === 'missed'
    );
};
