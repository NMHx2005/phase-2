import { mongoDB } from '../db/mongodb';
import { userService } from '../services/user.service';
import { groupService } from '../services/group.service';
import { channelService } from '../services/channel.service';
import { messageService } from '../services/message.service';
import bcrypt from 'bcrypt';

interface SampleData {
    users: any[];
    groups: any[];
    channels: any[];
    messages: any[];
}

export class SampleDataSeeder {
    private sampleData: SampleData = {
        users: [],
        groups: [],
        channels: [],
        messages: []
    };

    async seed(): Promise<void> {
        try {
            console.log('🌱 Starting sample data seeding...');

            await mongoDB.connect();

            // Clear existing data
            await this.clearExistingData();

            // Create sample users
            await this.createSampleUsers();

            // Create sample groups
            await this.createSampleGroups();

            // Create sample channels
            await this.createSampleChannels();

            // Create sample messages
            await this.createSampleMessages();

            console.log('✅ Sample data seeding completed successfully!');
            console.log(`📊 Created: ${this.sampleData.users.length} users, ${this.sampleData.groups.length} groups, ${this.sampleData.channels.length} channels, ${this.sampleData.messages.length} messages`);

        } catch (error) {
            console.error('❌ Error seeding sample data:', error);
            throw error;
        }
    }

    private async clearExistingData(): Promise<void> {
        console.log('🧹 Clearing existing data...');

        const collections = mongoDB.getCollections();
        await collections.users.deleteMany({});
        await collections.groups.deleteMany({});
        await collections.channels.deleteMany({});
        await collections.messages.deleteMany({});

        console.log('✅ Existing data cleared');
    }

    private async createSampleUsers(): Promise<void> {
        console.log('👥 Creating sample users...');

        const usersData = [
            {
                username: 'admin',
                email: 'admin@chatsystem.com',
                password: await bcrypt.hash('admin123', 10),
                roles: ['super_admin'],
                avatar: '/uploads/avatars/admin.jpg',
                isActive: true
            },
            {
                username: 'john_doe',
                email: 'john@example.com',
                password: await bcrypt.hash('password123', 10),
                roles: ['user'],
                avatar: '/uploads/avatars/john.jpg',
                isActive: true
            },
            {
                username: 'jane_smith',
                email: 'jane@example.com',
                password: await bcrypt.hash('password123', 10),
                roles: ['user'],
                avatar: '/uploads/avatars/jane.jpg',
                isActive: true
            },
            {
                username: 'mike_wilson',
                email: 'mike@example.com',
                password: await bcrypt.hash('password123', 10),
                roles: ['user'],
                avatar: '/uploads/avatars/mike.jpg',
                isActive: true
            },
            {
                username: 'sarah_jones',
                email: 'sarah@example.com',
                password: await bcrypt.hash('password123', 10),
                roles: ['user'],
                avatar: '/uploads/avatars/sarah.jpg',
                isActive: true
            },
            {
                username: 'alex_brown',
                email: 'alex@example.com',
                password: await bcrypt.hash('password123', 10),
                roles: ['user'],
                avatar: '/uploads/avatars/alex.jpg',
                isActive: false
            }
        ];

        for (const userData of usersData) {
            const user = await userService.create(userData);
            this.sampleData.users.push(user);
        }

        console.log(`✅ Created ${this.sampleData.users.length} users`);
    }

    private async createSampleGroups(): Promise<void> {
        console.log('👥 Creating sample groups...');

        const groupsData = [
            {
                name: 'General Discussion',
                description: 'A place for general discussions and announcements',
                isPrivate: false,
                createdBy: this.sampleData.users[0]._id, // admin
                members: [
                    {
                        userId: this.sampleData.users[0]._id,
                        username: this.sampleData.users[0].username,
                        role: 'admin',
                        joinedAt: new Date()
                    },
                    {
                        userId: this.sampleData.users[1]._id,
                        username: this.sampleData.users[1].username,
                        role: 'member',
                        joinedAt: new Date()
                    },
                    {
                        userId: this.sampleData.users[2]._id,
                        username: this.sampleData.users[2].username,
                        role: 'member',
                        joinedAt: new Date()
                    }
                ],
                admins: [this.sampleData.users[0]._id]
            },
            {
                name: 'Development Team',
                description: 'Internal discussions for the development team',
                isPrivate: true,
                createdBy: this.sampleData.users[1]._id, // john_doe
                members: [
                    {
                        userId: this.sampleData.users[1]._id,
                        username: this.sampleData.users[1].username,
                        role: 'admin',
                        joinedAt: new Date()
                    },
                    {
                        userId: this.sampleData.users[2]._id,
                        username: this.sampleData.users[2].username,
                        role: 'member',
                        joinedAt: new Date()
                    },
                    {
                        userId: this.sampleData.users[3]._id,
                        username: this.sampleData.users[3].username,
                        role: 'member',
                        joinedAt: new Date()
                    }
                ],
                admins: [this.sampleData.users[1]._id]
            },
            {
                name: 'Marketing',
                description: 'Marketing team discussions and campaigns',
                isPrivate: false,
                createdBy: this.sampleData.users[4]._id, // sarah_jones
                members: [
                    {
                        userId: this.sampleData.users[4]._id,
                        username: this.sampleData.users[4].username,
                        role: 'admin',
                        joinedAt: new Date()
                    },
                    {
                        userId: this.sampleData.users[2]._id,
                        username: this.sampleData.users[2].username,
                        role: 'member',
                        joinedAt: new Date()
                    }
                ],
                admins: [this.sampleData.users[4]._id]
            }
        ];

        for (const groupData of groupsData) {
            const group = await groupService.createGroup(groupData);
            this.sampleData.groups.push(group);
        }

        console.log(`✅ Created ${this.sampleData.groups.length} groups`);
    }

    private async createSampleChannels(): Promise<void> {
        console.log('📺 Creating sample channels...');

        const channelsData = [
            // General Discussion group channels
            {
                name: 'general',
                description: 'General discussions',
                groupId: this.sampleData.groups[0]._id,
                createdBy: this.sampleData.users[0]._id,
                isPrivate: false,
                type: 'text' as const,
                members: [
                    this.sampleData.users[0]._id,
                    this.sampleData.users[1]._id,
                    this.sampleData.users[2]._id
                ]
            },
            {
                name: 'announcements',
                description: 'Important announcements',
                groupId: this.sampleData.groups[0]._id,
                createdBy: this.sampleData.users[0]._id,
                isPrivate: false,
                type: 'text' as const,
                members: [
                    this.sampleData.users[0]._id,
                    this.sampleData.users[1]._id,
                    this.sampleData.users[2]._id
                ]
            },
            // Development Team group channels
            {
                name: 'frontend',
                description: 'Frontend development discussions',
                groupId: this.sampleData.groups[1]._id,
                createdBy: this.sampleData.users[1]._id,
                isPrivate: false,
                type: 'text' as const,
                members: [
                    this.sampleData.users[1]._id,
                    this.sampleData.users[2]._id,
                    this.sampleData.users[3]._id
                ]
            },
            {
                name: 'backend',
                description: 'Backend development discussions',
                groupId: this.sampleData.groups[1]._id,
                createdBy: this.sampleData.users[1]._id,
                isPrivate: false,
                type: 'text' as const,
                members: [
                    this.sampleData.users[1]._id,
                    this.sampleData.users[2]._id,
                    this.sampleData.users[3]._id
                ]
            },
            // Marketing group channels
            {
                name: 'campaigns',
                description: 'Marketing campaigns and strategies',
                groupId: this.sampleData.groups[2]._id,
                createdBy: this.sampleData.users[4]._id,
                isPrivate: false,
                type: 'text' as const,
                members: [
                    this.sampleData.users[4]._id,
                    this.sampleData.users[2]._id
                ]
            }
        ];

        for (const channelData of channelsData) {
            const channel = await channelService.createChannel(channelData);
            this.sampleData.channels.push(channel);
        }

        console.log(`✅ Created ${this.sampleData.channels.length} channels`);
    }

    private async createSampleMessages(): Promise<void> {
        console.log('💬 Creating sample messages...');

        const messagesData = [
            // Messages in general channel
            {
                channelId: this.sampleData.channels[0]._id,
                userId: this.sampleData.users[0]._id,
                username: this.sampleData.users[0].username,
                text: 'Welcome to the General Discussion channel! Feel free to introduce yourselves.',
                type: 'text' as const,
                timestamp: new Date(Date.now() - 86400000) // 1 day ago
            },
            {
                channelId: this.sampleData.channels[0]._id,
                userId: this.sampleData.users[1]._id,
                username: this.sampleData.users[1].username,
                text: 'Hello everyone! I\'m John, nice to meet you all.',
                type: 'text' as const,
                timestamp: new Date(Date.now() - 82800000) // 23 hours ago
            },
            {
                channelId: this.sampleData.channels[0]._id,
                userId: this.sampleData.users[2]._id,
                username: this.sampleData.users[2].username,
                text: 'Hi John! I\'m Jane, looking forward to working with everyone.',
                type: 'text' as const,
                timestamp: new Date(Date.now() - 79200000) // 22 hours ago
            },
            // Messages in announcements channel
            {
                channelId: this.sampleData.channels[1]._id,
                userId: this.sampleData.users[0]._id,
                username: this.sampleData.users[0].username,
                text: '📢 Important: Team meeting scheduled for tomorrow at 2 PM. Please attend.',
                type: 'text' as const,
                timestamp: new Date(Date.now() - 3600000) // 1 hour ago
            },
            // Messages in frontend channel
            {
                channelId: this.sampleData.channels[2]._id,
                userId: this.sampleData.users[1]._id,
                username: this.sampleData.users[1].username,
                text: 'Working on the new React components. Anyone want to review the code?',
                type: 'text' as const,
                timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
            },
            {
                channelId: this.sampleData.channels[2]._id,
                userId: this.sampleData.users[2]._id,
                username: this.sampleData.users[2].username,
                text: 'I can help review! Send me the PR link.',
                type: 'text' as const,
                timestamp: new Date(Date.now() - 900000) // 15 minutes ago
            },
            // Messages in backend channel
            {
                channelId: this.sampleData.channels[3]._id,
                userId: this.sampleData.users[3]._id,
                username: this.sampleData.users[3].username,
                text: 'API endpoints are ready for testing. Documentation updated.',
                type: 'text' as const,
                timestamp: new Date(Date.now() - 600000) // 10 minutes ago
            },
            // Messages in campaigns channel
            {
                channelId: this.sampleData.channels[4]._id,
                userId: this.sampleData.users[4]._id,
                username: this.sampleData.users[4].username,
                text: 'New marketing campaign launching next week. Need creative assets.',
                type: 'text' as const,
                timestamp: new Date(Date.now() - 300000) // 5 minutes ago
            },
            {
                channelId: this.sampleData.channels[4]._id,
                userId: this.sampleData.users[2]._id,
                username: this.sampleData.users[2].username,
                text: 'I can help with the graphics. What\'s the theme?',
                type: 'text' as const,
                timestamp: new Date(Date.now() - 120000) // 2 minutes ago
            },
            {
                channelId: this.sampleData.channels[4]._id,
                userId: this.sampleData.users[4]._id,
                username: this.sampleData.users[4].username,
                text: 'Tech innovation theme. I\'ll send you the brief.',
                type: 'text' as const,
                timestamp: new Date(Date.now() - 60000) // 1 minute ago
            }
        ];

        for (const messageData of messagesData) {
            const message = await messageService.createMessage(messageData);
            this.sampleData.messages.push(message);
        }

        console.log(`✅ Created ${this.sampleData.messages.length} messages`);
    }

    async getSampleData(): Promise<SampleData> {
        return this.sampleData;
    }
}

// Run seeder if called directly
if (require.main === module) {
    const seeder = new SampleDataSeeder();
    seeder.seed()
        .then(() => {
            console.log('🎉 Sample data seeding completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Sample data seeding failed:', error);
            process.exit(1);
        });
}
