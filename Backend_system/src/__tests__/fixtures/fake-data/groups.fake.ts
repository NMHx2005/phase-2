import { ObjectId } from 'mongodb';
import { FakeUser } from './users.fake';

export interface FakeGroup {
    _id: ObjectId;
    name: string;
    description: string;
    category: string;
    members: ObjectId[];
    channels: ObjectId[];
    createdBy: ObjectId;
    isPrivate: boolean;
    maxMembers?: number;
    tags: string[];
    settings: {
        allowMemberInvites: boolean;
        allowChannelCreation: boolean;
        requireApproval: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

export const createFakeGroups = (users: FakeUser[]): FakeGroup[] => {
    const groups: FakeGroup[] = [
        // Public groups
        {
            _id: new ObjectId(),
            name: 'General Discussion',
            description: 'A place for general discussions and announcements',
            category: 'General',
            members: [users[0]!._id, users[1]!._id, users[2]!._id, users[3]!._id, users[4]!._id],
            channels: [],
            createdBy: users[0]!._id,
            isPrivate: false,
            maxMembers: 100,
            tags: ['general', 'discussion', 'community'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: false
            },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Tech Enthusiasts',
            description: 'For technology enthusiasts and developers',
            category: 'Technology',
            members: [users[1]!._id, users[2]!._id, users[5]!._id, users[6]!._id, users[7]!._id, users[8]!._id],
            channels: [],
            createdBy: users[1]!._id,
            isPrivate: false,
            maxMembers: 50,
            tags: ['technology', 'programming', 'development'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: false
            },
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Gaming Community',
            description: 'Gaming discussions, tournaments, and team building',
            category: 'Gaming',
            members: [users[2]!._id, users[3]!._id, users[4]!._id, users[9]!._id, users[10]!._id, users[11]!._id],
            channels: [],
            createdBy: users[2]!._id,
            isPrivate: false,
            maxMembers: 200,
            tags: ['gaming', 'esports', 'tournaments'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: false
            },
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Music Lovers',
            description: 'Share music, discuss artists, and discover new songs',
            category: 'Entertainment',
            members: [users[3]!._id, users[4]!._id, users[5]!._id, users[12]!._id, users[13]!._id],
            channels: [],
            createdBy: users[3]!._id,
            isPrivate: false,
            maxMembers: 75,
            tags: ['music', 'artists', 'concerts'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: false
            },
            createdAt: new Date('2024-02-10'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Photography Club',
            description: 'Share photos, techniques, and photography tips',
            category: 'Arts & Hobbies',
            members: [users[4]!._id, users[5]!._id, users[6]!._id, users[14]!._id, users[15]!._id],
            channels: [],
            createdBy: users[4]!._id,
            isPrivate: false,
            maxMembers: 60,
            tags: ['photography', 'camera', 'techniques'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: false
            },
            createdAt: new Date('2024-02-20'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Fitness & Health',
            description: 'Fitness tips, workout routines, and health discussions',
            category: 'Community',
            members: [users[5]!._id, users[6]!._id, users[7]!._id, users[16]!._id, users[17]!._id],
            channels: [],
            createdBy: users[5]!._id,
            isPrivate: false,
            maxMembers: 80,
            tags: ['fitness', 'health', 'workout'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: false
            },
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Book Club',
            description: 'Book discussions, reviews, and reading recommendations',
            category: 'Community',
            members: [users[6]!._id, users[7]!._id, users[8]!._id, users[18]!._id, users[19]!._id],
            channels: [],
            createdBy: users[6]!._id,
            isPrivate: false,
            maxMembers: 40,
            tags: ['books', 'reading', 'literature'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: false
            },
            createdAt: new Date('2024-03-10'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Travel & Adventure',
            description: 'Share travel experiences, tips, and plan adventures',
            category: 'Lifestyle',
            members: [users[7]!._id, users[8]!._id, users[9]!._id, users[10]!._id, users[11]!._id],
            channels: [],
            createdBy: users[7]!._id,
            isPrivate: false,
            maxMembers: 90,
            tags: ['travel', 'adventure', 'destinations'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: false
            },
            createdAt: new Date('2024-03-20'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Cooking & Recipes',
            description: 'Share recipes, cooking tips, and food discussions',
            category: 'Food & Drink',
            members: [users[8]!._id, users[9]!._id, users[10]!._id, users[12]!._id, users[13]!._id],
            channels: [],
            createdBy: users[8]!._id,
            isPrivate: false,
            maxMembers: 70,
            tags: ['cooking', 'recipes', 'food'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: false
            },
            createdAt: new Date('2024-04-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Art & Design',
            description: 'Showcase artwork, design projects, and creative discussions',
            category: 'Arts & Hobbies',
            members: [users[9]!._id, users[10]!._id, users[11]!._id, users[14]!._id, users[15]!._id],
            channels: [],
            createdBy: users[9]!._id,
            isPrivate: false,
            maxMembers: 55,
            tags: ['art', 'design', 'creative'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: false
            },
            createdAt: new Date('2024-04-10'),
            updatedAt: new Date()
        },

        // Private groups
        {
            _id: new ObjectId(),
            name: 'VIP Members',
            description: 'Exclusive group for VIP members only',
            category: 'Premium',
            members: [users[0]!._id, users[1]!._id, users[2]!._id, users[3]!._id],
            channels: [],
            createdBy: users[0]!._id,
            isPrivate: true,
            maxMembers: 20,
            tags: ['vip', 'exclusive', 'premium'],
            settings: {
                allowMemberInvites: false,
                allowChannelCreation: false,
                requireApproval: true
            },
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Moderators Only',
            description: 'Internal group for moderators and admins',
            category: 'Administration',
            members: [users[0]!._id, users[1]!._id],
            channels: [],
            createdBy: users[0]!._id,
            isPrivate: true,
            maxMembers: 10,
            tags: ['moderators', 'admin', 'internal'],
            settings: {
                allowMemberInvites: false,
                allowChannelCreation: false,
                requireApproval: true
            },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Beta Testers',
            description: 'Group for beta testing new features',
            category: 'Development',
            members: [users[4]!._id, users[5]!._id, users[6]!._id, users[7]!._id, users[8]!._id],
            channels: [],
            createdBy: users[0]!._id,
            isPrivate: true,
            maxMembers: 30,
            tags: ['beta', 'testing', 'features'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: true
            },
            createdAt: new Date('2024-02-15'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Company Team',
            description: 'Internal team communication',
            category: 'Business',
            members: [users[0]!._id, users[1]!._id, users[2]!._id, users[3]!._id, users[4]!._id, users[5]!._id],
            channels: [],
            createdBy: users[0]!._id,
            isPrivate: true,
            maxMembers: 50,
            tags: ['company', 'team', 'internal'],
            settings: {
                allowMemberInvites: false,
                allowChannelCreation: false,
                requireApproval: true
            },
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            name: 'Project Alpha',
            description: 'Development team for Project Alpha',
            category: 'Development',
            members: [users[6]!._id, users[7]!._id, users[8]!._id, users[9]!._id],
            channels: [],
            createdBy: users[6]!._id,
            isPrivate: true,
            maxMembers: 15,
            tags: ['project', 'development', 'alpha'],
            settings: {
                allowMemberInvites: true,
                allowChannelCreation: true,
                requireApproval: true
            },
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date()
        }
    ];

    return groups;
};

export const getRandomGroup = (groups: FakeGroup[]): FakeGroup => {
    return groups[Math.floor(Math.random() * groups.length)]!;
};

export const getPublicGroups = (groups: FakeGroup[]): FakeGroup[] => {
    return groups.filter(group => !group.isPrivate);
};

export const getPrivateGroups = (groups: FakeGroup[]): FakeGroup[] => {
    return groups.filter(group => group.isPrivate);
};
