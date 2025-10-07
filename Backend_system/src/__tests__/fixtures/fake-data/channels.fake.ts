import { ObjectId } from 'mongodb';
import { FakeGroup } from './groups.fake';

export interface FakeChannel {
    _id: ObjectId;
    name: string;
    description: string;
    groupId: ObjectId;
    createdBy: ObjectId;
    isPrivate: boolean;
    isVoiceChannel: boolean;
    maxMembers?: number;
    permissions: {
        canSendMessages: boolean;
        canSendMedia: boolean;
        canCreateThreads: boolean;
        canMentionEveryone: boolean;
    };
    settings: {
        slowMode: number; // seconds
        requireApproval: boolean;
        allowReactions: boolean;
        allowPolls: boolean;
    };
    lastMessageAt?: Date;
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export const createFakeChannels = (groups: FakeGroup[]): FakeChannel[] => {
    const channels: FakeChannel[] = [];

    groups.forEach((group, groupIndex) => {
        // Add general channels for each group
        channels.push({
            _id: new ObjectId(),
            name: 'general',
            description: `General discussion for ${group.name}`,
            groupId: group._id,
            createdBy: group.createdBy,
            isPrivate: false,
            isVoiceChannel: false,
            maxMembers: group.maxMembers,
            permissions: {
                canSendMessages: true,
                canSendMedia: true,
                canCreateThreads: true,
                canMentionEveryone: true
            },
            settings: {
                slowMode: 0,
                requireApproval: false,
                allowReactions: true,
                allowPolls: true
            },
            lastMessageAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
            messageCount: Math.floor(Math.random() * 1000) + 100,
            createdAt: group.createdAt,
            updatedAt: new Date()
        });

        // Add announcement channel
        channels.push({
            _id: new ObjectId(),
            name: 'announcements',
            description: `Important announcements for ${group.name}`,
            groupId: group._id,
            createdBy: group.createdBy,
            isPrivate: false,
            isVoiceChannel: false,
            maxMembers: group.maxMembers,
            permissions: {
                canSendMessages: false, // Only admins can send
                canSendMedia: false,
                canCreateThreads: false,
                canMentionEveryone: false
            },
            settings: {
                slowMode: 0,
                requireApproval: true,
                allowReactions: true,
                allowPolls: false
            },
            lastMessageAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
            messageCount: Math.floor(Math.random() * 50) + 10,
            createdAt: group.createdAt,
            updatedAt: new Date()
        });

        // Add voice channel
        channels.push({
            _id: new ObjectId(),
            name: 'voice-chat',
            description: `Voice channel for ${group.name}`,
            groupId: group._id,
            createdBy: group.createdBy,
            isPrivate: false,
            isVoiceChannel: true,
            maxMembers: 10,
            permissions: {
                canSendMessages: false,
                canSendMedia: false,
                canCreateThreads: false,
                canMentionEveryone: false
            },
            settings: {
                slowMode: 0,
                requireApproval: false,
                allowReactions: false,
                allowPolls: false
            },
            lastMessageAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000),
            messageCount: 0,
            createdAt: group.createdAt,
            updatedAt: new Date()
        });

        // Add topic-specific channels based on group type
        if (group.name.includes('Tech') || group.name.includes('Programming')) {
            channels.push({
                _id: new ObjectId(),
                name: 'programming',
                description: 'Programming discussions and code sharing',
                groupId: group._id,
                createdBy: group.createdBy,
                isPrivate: false,
                isVoiceChannel: false,
                maxMembers: group.maxMembers,
                permissions: {
                    canSendMessages: true,
                    canSendMedia: true,
                    canCreateThreads: true,
                    canMentionEveryone: false
                },
                settings: {
                    slowMode: 5,
                    requireApproval: false,
                    allowReactions: true,
                    allowPolls: true
                },
                lastMessageAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
                messageCount: Math.floor(Math.random() * 500) + 200,
                createdAt: group.createdAt,
                updatedAt: new Date()
            });

            channels.push({
                _id: new ObjectId(),
                name: 'help',
                description: 'Get help with coding problems',
                groupId: group._id,
                createdBy: group.createdBy,
                isPrivate: false,
                isVoiceChannel: false,
                maxMembers: group.maxMembers,
                permissions: {
                    canSendMessages: true,
                    canSendMedia: true,
                    canCreateThreads: true,
                    canMentionEveryone: false
                },
                settings: {
                    slowMode: 10,
                    requireApproval: false,
                    allowReactions: true,
                    allowPolls: false
                },
                lastMessageAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000),
                messageCount: Math.floor(Math.random() * 300) + 150,
                createdAt: group.createdAt,
                updatedAt: new Date()
            });
        }

        if (group.name.includes('Gaming')) {
            channels.push({
                _id: new ObjectId(),
                name: 'general-gaming',
                description: 'General gaming discussions',
                groupId: group._id,
                createdBy: group.createdBy,
                isPrivate: false,
                isVoiceChannel: false,
                maxMembers: group.maxMembers,
                permissions: {
                    canSendMessages: true,
                    canSendMedia: true,
                    canCreateThreads: true,
                    canMentionEveryone: false
                },
                settings: {
                    slowMode: 0,
                    requireApproval: false,
                    allowReactions: true,
                    allowPolls: true
                },
                lastMessageAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000),
                messageCount: Math.floor(Math.random() * 800) + 300,
                createdAt: group.createdAt,
                updatedAt: new Date()
            });

            channels.push({
                _id: new ObjectId(),
                name: 'tournaments',
                description: 'Tournament announcements and discussions',
                groupId: group._id,
                createdBy: group.createdBy,
                isPrivate: false,
                isVoiceChannel: false,
                maxMembers: group.maxMembers,
                permissions: {
                    canSendMessages: true,
                    canSendMedia: true,
                    canCreateThreads: true,
                    canMentionEveryone: true
                },
                settings: {
                    slowMode: 0,
                    requireApproval: false,
                    allowReactions: true,
                    allowPolls: true
                },
                lastMessageAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                messageCount: Math.floor(Math.random() * 200) + 50,
                createdAt: group.createdAt,
                updatedAt: new Date()
            });
        }

        if (group.name.includes('Music')) {
            channels.push({
                _id: new ObjectId(),
                name: 'music-sharing',
                description: 'Share and discuss music',
                groupId: group._id,
                createdBy: group.createdBy,
                isPrivate: false,
                isVoiceChannel: false,
                maxMembers: group.maxMembers,
                permissions: {
                    canSendMessages: true,
                    canSendMedia: true,
                    canCreateThreads: true,
                    canMentionEveryone: false
                },
                settings: {
                    slowMode: 0,
                    requireApproval: false,
                    allowReactions: true,
                    allowPolls: true
                },
                lastMessageAt: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000),
                messageCount: Math.floor(Math.random() * 400) + 100,
                createdAt: group.createdAt,
                updatedAt: new Date()
            });
        }

        if (group.name.includes('Photography')) {
            channels.push({
                _id: new ObjectId(),
                name: 'photo-gallery',
                description: 'Share your photography work',
                groupId: group._id,
                createdBy: group.createdBy,
                isPrivate: false,
                isVoiceChannel: false,
                maxMembers: group.maxMembers,
                permissions: {
                    canSendMessages: true,
                    canSendMedia: true,
                    canCreateThreads: true,
                    canMentionEveryone: false
                },
                settings: {
                    slowMode: 0,
                    requireApproval: false,
                    allowReactions: true,
                    allowPolls: false
                },
                lastMessageAt: new Date(Date.now() - Math.random() * 8 * 60 * 60 * 1000),
                messageCount: Math.floor(Math.random() * 300) + 80,
                createdAt: group.createdAt,
                updatedAt: new Date()
            });
        }

        // Add private channels for some groups
        if (group.isPrivate || groupIndex % 3 === 0) {
            channels.push({
                _id: new ObjectId(),
                name: 'private-discussion',
                description: 'Private discussions for members only',
                groupId: group._id,
                createdBy: group.createdBy,
                isPrivate: true,
                isVoiceChannel: false,
                maxMembers: group.maxMembers,
                permissions: {
                    canSendMessages: true,
                    canSendMedia: true,
                    canCreateThreads: true,
                    canMentionEveryone: false
                },
                settings: {
                    slowMode: 0,
                    requireApproval: false,
                    allowReactions: true,
                    allowPolls: true
                },
                lastMessageAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
                messageCount: Math.floor(Math.random() * 150) + 50,
                createdAt: group.createdAt,
                updatedAt: new Date()
            });
        }

        // Add admin-only channels for some groups
        if (groupIndex < 5) {
            channels.push({
                _id: new ObjectId(),
                name: 'admin-only',
                description: 'Admin discussions and moderation',
                groupId: group._id,
                createdBy: group.createdBy,
                isPrivate: true,
                isVoiceChannel: false,
                maxMembers: 10,
                permissions: {
                    canSendMessages: false, // Only admins
                    canSendMedia: false,
                    canCreateThreads: false,
                    canMentionEveryone: false
                },
                settings: {
                    slowMode: 0,
                    requireApproval: true,
                    allowReactions: true,
                    allowPolls: true
                },
                lastMessageAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
                messageCount: Math.floor(Math.random() * 50) + 10,
                createdAt: group.createdAt,
                updatedAt: new Date()
            });
        }
    });

    return channels;
};

export const getRandomChannel = (channels: FakeChannel[]): FakeChannel => {
    return channels[Math.floor(Math.random() * channels.length)]!;
};

export const getChannelsByGroup = (channels: FakeChannel[], groupId: ObjectId): FakeChannel[] => {
    return channels.filter(channel => channel.groupId.equals(groupId));
};

export const getPublicChannels = (channels: FakeChannel[]): FakeChannel[] => {
    return channels.filter(channel => !channel.isPrivate);
};

export const getPrivateChannels = (channels: FakeChannel[]): FakeChannel[] => {
    return channels.filter(channel => channel.isPrivate);
};

export const getVoiceChannels = (channels: FakeChannel[]): FakeChannel[] => {
    return channels.filter(channel => channel.isVoiceChannel);
};
