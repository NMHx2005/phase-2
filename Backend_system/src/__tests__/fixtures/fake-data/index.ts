import { createFakeUsers, FakeUser, getRandomUser, getActiveUsers, getAdminUsers } from './users.fake';
import { createFakeGroups, FakeGroup, getRandomGroup, getPublicGroups, getPrivateGroups } from './groups.fake';
import { createFakeChannels, FakeChannel, getRandomChannel, getChannelsByGroup, getPublicChannels, getPrivateChannels, getVoiceChannels } from './channels.fake';
import { createFakeMessages, FakeMessage, getRandomMessage, getMessagesByChannel, getMessagesByUser } from './messages.fake';
import { createFakeVideoCalls, FakeVideoCall, getRandomVideoCall, getVideoCallsByUser, getVideoCallsByChannel, getVideoCallsByStatus, getActiveVideoCalls, getCompletedVideoCalls } from './video-calls.fake';

export interface FakeData {
    users: FakeUser[];
    groups: FakeGroup[];
    channels: FakeChannel[];
    messages: FakeMessage[];
    videoCalls: FakeVideoCall[];
}

export const createFakeData = async (): Promise<FakeData> => {
    console.log('Creating fake users...');
    const users = await createFakeUsers();

    console.log('Creating fake groups...');
    const groups = createFakeGroups(users);

    console.log('Creating fake channels...');
    const channels = createFakeChannels(groups);

    console.log('Creating fake messages...');
    const messages = createFakeMessages(users, channels);

    console.log('Creating fake video calls...');
    const videoCalls = createFakeVideoCalls(users, channels);

    console.log('Fake data creation completed!');
    console.log(`- Users: ${users.length}`);
    console.log(`- Groups: ${groups.length}`);
    console.log(`- Channels: ${channels.length}`);
    console.log(`- Messages: ${messages.length}`);
    console.log(`- Video Calls: ${videoCalls.length}`);

    return {
        users,
        groups,
        channels,
        messages,
        videoCalls
    };
};

// Export all types
export type { FakeUser, FakeGroup, FakeChannel, FakeMessage, FakeVideoCall };

// Export all utility functions
export {
    // Users
    createFakeUsers,
    getRandomUser,
    getActiveUsers,
    getAdminUsers,

    // Groups
    createFakeGroups,
    getRandomGroup,
    getPublicGroups,
    getPrivateGroups,

    // Channels
    createFakeChannels,
    getRandomChannel,
    getChannelsByGroup,
    getPublicChannels,
    getPrivateChannels,
    getVoiceChannels,

    // Messages
    createFakeMessages,
    getRandomMessage,
    getMessagesByChannel,
    getMessagesByUser,

    // Video Calls
    createFakeVideoCalls,
    getRandomVideoCall,
    getVideoCallsByUser,
    getVideoCallsByChannel,
    getVideoCallsByStatus,
    getActiveVideoCalls,
    getCompletedVideoCalls
};
