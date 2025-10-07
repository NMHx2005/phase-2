import { mongoDB } from '../db/mongodb';
import { IUser, IGroup, IChannel, IMessage, IVideoCall, IGroupRequest } from '../models';
import bcrypt from 'bcrypt';

export class DatabaseSeeder {
    private static instance: DatabaseSeeder;

    public static getInstance(): DatabaseSeeder {
        if (!DatabaseSeeder.instance) {
            DatabaseSeeder.instance = new DatabaseSeeder();
        }
        return DatabaseSeeder.instance;
    }

    async seedDatabase(): Promise<void> {
        try {
            console.log('🌱 Starting database seeding...');

            // Check if data already exists
            const collections = mongoDB.getCollections();
            const userCount = await collections.users.countDocuments();

            if (userCount > 0) {
                console.log('📊 Database already seeded, skipping...');
                return;
            }

            // Seed users
            await this.seedUsers();

            // Seed groups
            await this.seedGroups();

            // Seed channels
            await this.seedChannels();

            // Seed messages
            await this.seedMessages();

            // Seed video calls
            await this.seedVideoCalls();

            // Seed group requests
            await this.seedGroupRequests();

            console.log('✅ Database seeding completed successfully!');
        } catch (error) {
            console.error('❌ Error seeding database:', error);
            throw error;
        }
    }

    private async seedUsers(): Promise<void> {
        const collections = mongoDB.getCollections();

        const users: Omit<IUser, '_id'>[] = [
            {
                username: 'super',
                email: 'super@example.com',
                password: await bcrypt.hash('123', 10),
                roles: ['super_admin'],
                groups: [],
                isActive: true,
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date(),
                lastLogin: new Date(),
                avatar: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=S',
                bio: 'Super Administrator',
                phone: '+1234567890',
                address: '123 Admin Street'
            },
            {
                username: 'admin',
                email: 'admin@example.com',
                password: await bcrypt.hash('123', 10),
                roles: ['group_admin'],
                groups: [],
                isActive: true,
                createdAt: new Date('2025-01-15'),
                updatedAt: new Date(),
                lastLogin: new Date(),
                avatar: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=A',
                bio: 'Group Administrator',
                phone: '+1234567891',
                address: '456 Admin Avenue'
            },
            {
                username: 'user1',
                email: 'user1@example.com',
                password: await bcrypt.hash('123', 10),
                roles: ['user'],
                groups: [],
                isActive: true,
                createdAt: new Date('2025-01-20'),
                updatedAt: new Date(),
                lastLogin: new Date(),
                avatar: 'https://via.placeholder.com/150/45B7D1/FFFFFF?text=U1',
                bio: 'Regular User 1',
                phone: '+1234567892',
                address: '789 User Street'
            },
            {
                username: 'user2',
                email: 'user2@example.com',
                password: await bcrypt.hash('123', 10),
                roles: ['user'],
                groups: [],
                isActive: true,
                createdAt: new Date('2025-01-25'),
                updatedAt: new Date(),
                lastLogin: new Date(),
                avatar: 'https://via.placeholder.com/150/96CEB4/FFFFFF?text=U2',
                bio: 'Regular User 2',
                phone: '+1234567893',
                address: '321 User Avenue'
            },
            {
                username: 'user3',
                email: 'user3@example.com',
                password: await bcrypt.hash('123', 10),
                roles: ['user'],
                groups: [],
                isActive: true,
                createdAt: new Date('2025-02-01'),
                updatedAt: new Date(),
                lastLogin: new Date(),
                avatar: 'https://via.placeholder.com/150/FFEAA7/FFFFFF?text=U3',
                bio: 'Regular User 3',
                phone: '+1234567894',
                address: '654 User Boulevard'
            }
        ];

        await collections.users.insertMany(users);
        console.log('👥 Users seeded successfully');
    }

    private async seedGroups(): Promise<void> {
        const collections = mongoDB.getCollections();

        // Get user IDs
        const users = await collections.users.find({}).toArray();
        const superUser = users.find(u => u.username === 'super');
        const adminUser = users.find(u => u.username === 'admin');
        const user1 = users.find(u => u.username === 'user1');
        const user2 = users.find(u => u.username === 'user2');
        const user3 = users.find(u => u.username === 'user3');

        if (!superUser || !adminUser || !user1 || !user2 || !user3) {
            throw new Error('Required users not found for group seeding');
        }

        const groups: Omit<IGroup, '_id'>[] = [
            {
                name: 'Development Team',
                description: 'Main development team for the chat system project',
                members: [
                    {
                        userId: superUser._id!,
                        username: 'super',
                        role: 'admin',
                        joinedAt: new Date('2025-01-01')
                    },
                    {
                        userId: adminUser._id!,
                        username: 'admin',
                        role: 'admin',
                        joinedAt: new Date('2025-01-15')
                    },
                    {
                        userId: user1._id!,
                        username: 'user1',
                        role: 'member',
                        joinedAt: new Date('2025-01-20')
                    }
                ],
                admins: [superUser._id!, adminUser._id!],
                isActive: true,
                isPrivate: false,
                maxMembers: 50,
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date(),
                createdBy: superUser._id!,
                avatar: 'https://via.placeholder.com/150/FF6B6B/FFFFFF?text=DT',
                tags: ['development', 'main', 'team'],
                rules: [
                    'Be respectful to all team members',
                    'Keep discussions relevant to development',
                    'Use appropriate language'
                ]
            },
            {
                name: 'Design Team',
                description: 'UI/UX design team for the chat system',
                members: [
                    {
                        userId: adminUser._id!,
                        username: 'admin',
                        role: 'admin',
                        joinedAt: new Date('2025-01-15')
                    },
                    {
                        userId: user2._id!,
                        username: 'user2',
                        role: 'member',
                        joinedAt: new Date('2025-01-25')
                    }
                ],
                admins: [adminUser._id!],
                isActive: true,
                isPrivate: false,
                maxMembers: 20,
                createdAt: new Date('2025-01-15'),
                updatedAt: new Date(),
                createdBy: adminUser._id!,
                avatar: 'https://via.placeholder.com/150/4ECDC4/FFFFFF?text=DS',
                tags: ['design', 'ui', 'ux'],
                rules: [
                    'Share design resources and inspiration',
                    'Provide constructive feedback',
                    'Maintain design consistency'
                ]
            },
            {
                name: 'Marketing Team',
                description: 'Marketing and promotion team',
                members: [
                    {
                        userId: user3._id!,
                        username: 'user3',
                        role: 'admin',
                        joinedAt: new Date('2025-02-01')
                    }
                ],
                admins: [user3._id!],
                isActive: true,
                isPrivate: true,
                maxMembers: 15,
                createdAt: new Date('2025-02-01'),
                updatedAt: new Date(),
                createdBy: user3._id!,
                avatar: 'https://via.placeholder.com/150/96CEB4/FFFFFF?text=MT',
                tags: ['marketing', 'promotion', 'outreach'],
                rules: [
                    'Keep marketing strategies confidential',
                    'Coordinate campaigns effectively',
                    'Track and report results'
                ]
            }
        ];

        await collections.groups.insertMany(groups);
        console.log('👥 Groups seeded successfully');
    }

    private async seedChannels(): Promise<void> {
        const collections = mongoDB.getCollections();

        // Get group IDs
        const groups = await collections.groups.find({}).toArray();
        const devGroup = groups.find(g => g.name === 'Development Team');
        const designGroup = groups.find(g => g.name === 'Design Team');
        const marketingGroup = groups.find(g => g.name === 'Marketing Team');

        if (!devGroup || !designGroup || !marketingGroup) {
            throw new Error('Required groups not found for channel seeding');
        }

        const channels: Omit<IChannel, '_id'>[] = [
            {
                name: 'general',
                description: 'General discussion channel for development team',
                groupId: devGroup._id!,
                type: 'text',
                isActive: true,
                isPrivate: false,
                members: devGroup.members.map((m: any) => m.userId),
                admins: devGroup.admins,
                createdAt: new Date('2025-01-01'),
                updatedAt: new Date(),
                createdBy: devGroup.createdBy,
                settings: {
                    allowFileUploads: true,
                    allowImageUploads: true,
                    allowVideoUploads: true,
                    maxFileSize: 10 * 1024 * 1024,
                    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/pdf']
                }
            },
            {
                name: 'backend',
                description: 'Backend development discussions',
                groupId: devGroup._id!,
                type: 'text',
                isActive: true,
                isPrivate: false,
                members: devGroup.members.map((m: any) => m.userId),
                admins: devGroup.admins,
                createdAt: new Date('2025-01-02'),
                updatedAt: new Date(),
                createdBy: devGroup.createdBy,
                settings: {
                    allowFileUploads: true,
                    allowImageUploads: true,
                    allowVideoUploads: false,
                    maxFileSize: 5 * 1024 * 1024,
                    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf', 'text/plain']
                }
            },
            {
                name: 'frontend',
                description: 'Frontend development discussions',
                groupId: devGroup._id!,
                type: 'text',
                isActive: true,
                isPrivate: false,
                members: devGroup.members.map((m: any) => m.userId),
                admins: devGroup.admins,
                createdAt: new Date('2025-01-03'),
                updatedAt: new Date(),
                createdBy: devGroup.createdBy
            },
            {
                name: 'design-feedback',
                description: 'Design feedback and reviews',
                groupId: designGroup._id!,
                type: 'text',
                isActive: true,
                isPrivate: false,
                members: designGroup.members.map((m: any) => m.userId),
                admins: designGroup.admins,
                createdAt: new Date('2025-01-15'),
                updatedAt: new Date(),
                createdBy: designGroup.createdBy
            },
            {
                name: 'marketing-strategy',
                description: 'Marketing strategy discussions',
                groupId: marketingGroup._id!,
                type: 'text',
                isActive: true,
                isPrivate: true,
                members: marketingGroup.members.map((m: any) => m.userId),
                admins: marketingGroup.admins,
                createdAt: new Date('2025-02-01'),
                updatedAt: new Date(),
                createdBy: marketingGroup.createdBy
            }
        ];

        await collections.channels.insertMany(channels);
        console.log('📺 Channels seeded successfully');
    }

    private async seedMessages(): Promise<void> {
        const collections = mongoDB.getCollections();

        // Get channel and user IDs
        const channels = await collections.channels.find({}).toArray();
        const users = await collections.users.find({}).toArray();

        const generalChannel = channels.find(c => c.name === 'general');
        const backendChannel = channels.find(c => c.name === 'backend');
        const frontendChannel = channels.find(c => c.name === 'frontend');

        const superUser = users.find(u => u.username === 'super');
        const adminUser = users.find(u => u.username === 'admin');
        const user1 = users.find(u => u.username === 'user1');

        if (!generalChannel || !backendChannel || !frontendChannel || !superUser || !adminUser || !user1) {
            throw new Error('Required channels or users not found for message seeding');
        }

        const messages: Omit<IMessage, '_id'>[] = [
            // General channel messages
            {
                channelId: generalChannel._id!,
                userId: superUser._id!,
                username: 'super',
                text: 'Welcome everyone to the Development Team! 👋',
                type: 'text',
                isEdited: false,
                isDeleted: false,
                createdAt: new Date(Date.now() - 3600000),
                updatedAt: new Date(Date.now() - 3600000)
            },
            {
                channelId: generalChannel._id!,
                userId: adminUser._id!,
                username: 'admin',
                text: 'This is a sample message for testing.',
                type: 'text',
                isEdited: false,
                isDeleted: false,
                createdAt: new Date(Date.now() - 1800000),
                updatedAt: new Date(Date.now() - 1800000)
            },
            {
                channelId: generalChannel._id!,
                userId: user1._id!,
                username: 'user1',
                text: 'Another message to show activity.',
                type: 'text',
                isEdited: false,
                isDeleted: false,
                createdAt: new Date(Date.now() - 900000),
                updatedAt: new Date(Date.now() - 900000)
            },
            // Backend channel messages
            {
                channelId: backendChannel._id!,
                userId: superUser._id!,
                username: 'super',
                text: 'Backend API is ready for testing!',
                type: 'text',
                isEdited: false,
                isDeleted: false,
                createdAt: new Date(Date.now() - 7200000),
                updatedAt: new Date(Date.now() - 7200000)
            },
            {
                channelId: backendChannel._id!,
                userId: adminUser._id!,
                username: 'admin',
                text: 'Great work on the MongoDB integration!',
                type: 'text',
                isEdited: false,
                isDeleted: false,
                createdAt: new Date(Date.now() - 3600000),
                updatedAt: new Date(Date.now() - 3600000)
            },
            // Frontend channel messages
            {
                channelId: frontendChannel._id!,
                userId: user1._id!,
                username: 'user1',
                text: 'Frontend components are looking good!',
                type: 'text',
                isEdited: false,
                isDeleted: false,
                createdAt: new Date(Date.now() - 5400000),
                updatedAt: new Date(Date.now() - 5400000)
            },
            {
                channelId: frontendChannel._id!,
                userId: adminUser._id!,
                username: 'admin',
                text: 'The UI/UX is really coming together nicely.',
                type: 'text',
                isEdited: false,
                isDeleted: false,
                createdAt: new Date(Date.now() - 2700000),
                updatedAt: new Date(Date.now() - 2700000)
            }
        ];

        await collections.messages.insertMany(messages);
        console.log('💬 Messages seeded successfully');
    }

    private async seedVideoCalls(): Promise<void> {
        const collections = mongoDB.getCollections();

        // Get user IDs
        const users = await collections.users.find({}).toArray();
        const superUser = users.find(u => u.username === 'super');
        const adminUser = users.find(u => u.username === 'admin');
        const user1 = users.find(u => u.username === 'user1');

        if (!superUser || !adminUser || !user1) {
            throw new Error('Required users not found for video call seeding');
        }

        const videoCalls: Omit<IVideoCall, '_id'>[] = [
            {
                callerId: superUser._id!,
                callerName: 'super',
                receiverId: adminUser._id!,
                receiverName: 'admin',
                status: 'ended',
                startTime: new Date(Date.now() - 86400000), // 1 day ago
                endTime: new Date(Date.now() - 86340000), // 1 day ago + 10 minutes
                duration: 600, // 10 minutes
                createdAt: new Date(Date.now() - 86400000),
                updatedAt: new Date(Date.now() - 86340000),
                callType: 'video',
                quality: {
                    video: 'high',
                    audio: 'high'
                }
            },
            {
                callerId: adminUser._id!,
                callerName: 'admin',
                receiverId: user1._id!,
                receiverName: 'user1',
                status: 'ended',
                startTime: new Date(Date.now() - 43200000), // 12 hours ago
                endTime: new Date(Date.now() - 43140000), // 12 hours ago + 10 minutes
                duration: 600, // 10 minutes
                createdAt: new Date(Date.now() - 43200000),
                updatedAt: new Date(Date.now() - 43140000),
                callType: 'video',
                quality: {
                    video: 'medium',
                    audio: 'high'
                }
            }
        ];

        await collections.videoCalls.insertMany(videoCalls);
        console.log('📹 Video calls seeded successfully');
    }

    private async seedGroupRequests(): Promise<void> {
        const collections = mongoDB.getCollections();

        // Get group and user IDs
        const groups = await collections.groups.find({}).toArray();
        const users = await collections.users.find({}).toArray();

        const devGroup = groups.find(g => g.name === 'Development Team');
        const designGroup = groups.find(g => g.name === 'Design Team');
        const marketingGroup = groups.find(g => g.name === 'Marketing Team');

        const user2 = users.find(u => u.username === 'user2');
        const user3 = users.find(u => u.username === 'user3');

        if (!devGroup || !designGroup || !marketingGroup || !user2 || !user3) {
            throw new Error('Required groups or users not found for group request seeding');
        }

        const groupRequests: Omit<IGroupRequest, '_id'>[] = [
            {
                groupId: devGroup._id!,
                groupName: 'Development Team',
                userId: user2._id!,
                username: 'user2',
                requestType: 'register_interest',
                status: 'pending',
                requestedAt: new Date(Date.now() - 3600000),
                createdAt: new Date(Date.now() - 3600000),
                updatedAt: new Date(Date.now() - 3600000),
                message: 'I would like to join the development team to contribute to the project.'
            },
            {
                groupId: designGroup._id!,
                groupName: 'Design Team',
                userId: user3._id!,
                username: 'user3',
                requestType: 'request_invite',
                status: 'approved',
                requestedAt: new Date(Date.now() - 7200000),
                reviewedBy: designGroup.createdBy,
                reviewedAt: new Date(Date.now() - 3600000),
                createdAt: new Date(Date.now() - 7200000),
                updatedAt: new Date(Date.now() - 3600000),
                message: 'I have experience in UI/UX design and would like to contribute.'
            }
        ];

        await collections.groupRequests.insertMany(groupRequests);
        console.log('📝 Group requests seeded successfully');
    }
}