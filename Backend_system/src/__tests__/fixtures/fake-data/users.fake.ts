import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

export interface FakeUser {
    _id: ObjectId;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    roles: string[];
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export const createFakeUsers = async (): Promise<FakeUser[]> => {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users: FakeUser[] = [
        // Admin users
        {
            _id: new ObjectId(),
            username: 'admin',
            email: 'admin@chat-system.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            roles: ['group_admin', 'user'],
            isActive: true,
            lastLoginAt: new Date(),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'superadmin',
            email: 'superadmin@chat-system.com',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
            roles: ['super_admin', 'group_admin', 'user'],
            isActive: true,
            lastLoginAt: new Date(),
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        },

        // Regular users
        {
            _id: new ObjectId(),
            username: 'john_doe',
            email: 'john.doe@example.com',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Doe',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'jane_smith',
            email: 'jane.smith@example.com',
            password: hashedPassword,
            firstName: 'Jane',
            lastName: 'Smith',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            createdAt: new Date('2024-01-20'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'mike_wilson',
            email: 'mike.wilson@example.com',
            password: hashedPassword,
            firstName: 'Mike',
            lastName: 'Wilson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
            createdAt: new Date('2024-02-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'sarah_johnson',
            email: 'sarah.johnson@example.com',
            password: hashedPassword,
            firstName: 'Sarah',
            lastName: 'Johnson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            createdAt: new Date('2024-02-10'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'david_brown',
            email: 'david.brown@example.com',
            password: hashedPassword,
            firstName: 'David',
            lastName: 'Brown',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
            createdAt: new Date('2024-02-15'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'emma_davis',
            email: 'emma.davis@example.com',
            password: hashedPassword,
            firstName: 'Emma',
            lastName: 'Davis',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            createdAt: new Date('2024-02-20'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'alex_garcia',
            email: 'alex.garcia@example.com',
            password: hashedPassword,
            firstName: 'Alex',
            lastName: 'Garcia',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'lisa_martinez',
            email: 'lisa.martinez@example.com',
            password: hashedPassword,
            firstName: 'Lisa',
            lastName: 'Martinez',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
            createdAt: new Date('2024-03-05'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'tom_anderson',
            email: 'tom.anderson@example.com',
            password: hashedPassword,
            firstName: 'Tom',
            lastName: 'Anderson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tom',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            createdAt: new Date('2024-03-10'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'anna_taylor',
            email: 'anna.taylor@example.com',
            password: hashedPassword,
            firstName: 'Anna',
            lastName: 'Taylor',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
            createdAt: new Date('2024-03-15'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'chris_lee',
            email: 'chris.lee@example.com',
            password: hashedPassword,
            firstName: 'Chris',
            lastName: 'Lee',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chris',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            createdAt: new Date('2024-03-20'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'maria_rodriguez',
            email: 'maria.rodriguez@example.com',
            password: hashedPassword,
            firstName: 'Maria',
            lastName: 'Rodriguez',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            createdAt: new Date('2024-03-25'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'james_white',
            email: 'james.white@example.com',
            password: hashedPassword,
            firstName: 'James',
            lastName: 'White',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            createdAt: new Date('2024-04-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'sophie_clark',
            email: 'sophie.clark@example.com',
            password: hashedPassword,
            firstName: 'Sophie',
            lastName: 'Clark',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            createdAt: new Date('2024-04-05'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'ryan_moore',
            email: 'ryan.moore@example.com',
            password: hashedPassword,
            firstName: 'Ryan',
            lastName: 'Moore',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            createdAt: new Date('2024-04-10'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'olivia_hall',
            email: 'olivia.hall@example.com',
            password: hashedPassword,
            firstName: 'Olivia',
            lastName: 'Hall',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=olivia',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            createdAt: new Date('2024-04-15'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'daniel_young',
            email: 'daniel.young@example.com',
            password: hashedPassword,
            firstName: 'Daniel',
            lastName: 'Young',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=daniel',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
            createdAt: new Date('2024-04-20'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'isabella_king',
            email: 'isabella.king@example.com',
            password: hashedPassword,
            firstName: 'Isabella',
            lastName: 'King',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=isabella',
            roles: ['user'],
            isActive: true,
            lastLoginAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            createdAt: new Date('2024-04-25'),
            updatedAt: new Date()
        },

        // Inactive users
        {
            _id: new ObjectId(),
            username: 'inactive_user',
            email: 'inactive@example.com',
            password: hashedPassword,
            firstName: 'Inactive',
            lastName: 'User',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=inactive',
            roles: ['user'],
            isActive: false,
            lastLoginAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        },
        {
            _id: new ObjectId(),
            username: 'banned_user',
            email: 'banned@example.com',
            password: hashedPassword,
            firstName: 'Banned',
            lastName: 'User',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=banned',
            roles: ['user'],
            isActive: false,
            lastLoginAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        }
    ];

    return users;
};

export const getRandomUser = (users: FakeUser[]): FakeUser => {
    return users[Math.floor(Math.random() * users.length)]!;
};

export const getActiveUsers = (users: FakeUser[]): FakeUser[] => {
    return users.filter(user => user.isActive);
};

export const getAdminUsers = (users: FakeUser[]): FakeUser[] => {
    return users.filter(user => user.roles.includes('super_admin') || user.roles.includes('group_admin'));
};
