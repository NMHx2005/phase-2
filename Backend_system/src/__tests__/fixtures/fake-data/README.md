# Fake Data Generator

This directory contains comprehensive fake data generators for all models in the chat system.

## 📁 Structure

```
fake-data/
├── index.ts                 # Main export file
├── seed-database.ts         # Database seeding script
├── users.fake.ts           # User fake data (25+ users)
├── groups.fake.ts          # Group fake data (15+ groups)
├── channels.fake.ts        # Channel fake data (50+ channels)
├── messages.fake.ts        # Message fake data (500+ messages)
├── video-calls.fake.ts     # Video call fake data (150+ calls)
└── README.md               # This file
```

## 🚀 Usage

### Generate and Seed Database

```bash
# Seed production database
npm run seed:fake

# Seed test database
npm run seed:test
```

### Use in Tests

```typescript
import { createFakeData, FakeUser, getRandomUser } from '../fixtures/fake-data';

describe('My Test', () => {
    let fakeData: any;
    
    beforeEach(async () => {
        fakeData = await createFakeData();
    });
    
    it('should work with fake data', () => {
        const randomUser = getRandomUser(fakeData.users);
        expect(randomUser).toBeDefined();
    });
});
```

## 📊 Data Statistics

### Users (25+ records)
- **Admin users**: 2 (admin, superadmin)
- **Regular users**: 20+ active users
- **Inactive users**: 2 (banned, inactive)
- **Features**: Realistic names, emails, avatars, roles, login times

### Groups (15+ records)
- **Public groups**: 10+ (Tech, Gaming, Music, Photography, etc.)
- **Private groups**: 5+ (VIP, Moderators, Beta Testers, etc.)
- **Features**: Descriptions, member limits, settings, tags

### Channels (50+ records)
- **General channels**: 1 per group
- **Announcement channels**: 1 per group
- **Voice channels**: 1 per group
- **Topic-specific channels**: Based on group type
- **Private channels**: For private groups
- **Admin channels**: For moderation

### Messages (500+ records)
- **Text messages**: 90% of messages
- **Media messages**: 10% (images, files)
- **Features**: Reactions, mentions, replies, editing, deletion
- **Realistic content**: Varied message templates

### Video Calls (150+ records)
- **Status distribution**: Various call statuses
- **Duration**: Realistic call durations
- **Quality settings**: Video/audio quality levels
- **Device metadata**: Browser, OS, network type
- **Participant data**: Join/leave times, mute status

## 🛠️ Customization

### Adding More Data

```typescript
// In users.fake.ts
export const createFakeUsers = async (): Promise<FakeUser[]> => {
    const users = [
        // ... existing users
        {
            _id: new ObjectId(),
            username: 'new_user',
            email: 'new@example.com',
            // ... other fields
        }
    ];
    return users;
};
```

### Modifying Data Patterns

```typescript
// In messages.fake.ts
const messageTemplates = [
    "Hello everyone!",
    "Great discussion!",
    // Add your own templates
    "Custom message template"
];
```

## 🔧 Utility Functions

### User Utilities
- `getRandomUser(users)` - Get random user
- `getActiveUsers(users)` - Get active users only
- `getAdminUsers(users)` - Get admin users only

### Group Utilities
- `getRandomGroup(groups)` - Get random group
- `getPublicGroups(groups)` - Get public groups
- `getPrivateGroups(groups)` - Get private groups

### Channel Utilities
- `getRandomChannel(channels)` - Get random channel
- `getChannelsByGroup(channels, groupId)` - Get channels for group
- `getVoiceChannels(channels)` - Get voice channels only

### Message Utilities
- `getRandomMessage(messages)` - Get random message
- `getMessagesByChannel(messages, channelId)` - Get messages for channel
- `getMessagesByUser(messages, userId)` - Get messages by user

### Video Call Utilities
- `getRandomVideoCall(calls)` - Get random video call
- `getActiveVideoCalls(calls)` - Get active calls
- `getCompletedVideoCalls(calls)` - Get completed calls

## 📝 Notes

- All data is generated with realistic timestamps
- Relationships between models are properly maintained
- Data includes edge cases and various states
- Generated data is suitable for both testing and development
- All fake data respects model constraints and validation rules

## 🚨 Important

- **Never use fake data in production**
- **Always clear database before seeding**
- **Use test database for testing**
- **Fake data is for development and testing only**
