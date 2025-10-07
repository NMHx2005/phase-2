import { Collection, ObjectId, Document } from 'mongodb';
import { mongoDB } from '../db/mongodb';
import { IUser, IUserCreate, IUserUpdate, IUserResponse, UserModel } from '../models/user.model';
import bcrypt from 'bcrypt';

export class UserService {
    private collection: Collection<IUser> | null = null;

    constructor() {
        // Lazy initialization - will be set when first method is called
    }

    private getCollection(): Collection<IUser> {
        if (!this.collection) {
            this.collection = mongoDB.getCollection<IUser>('users');
        }
        return this.collection;
    }

    async create(userData: IUserCreate): Promise<IUserResponse> {
        try {
            // Check if user already exists
            const existingUser = await this.getCollection().findOne({
                $or: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            });

            if (existingUser) {
                throw new Error('User with this email or username already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create user
            const user = UserModel.toCreate({
                ...userData,
                password: hashedPassword
            });

            const result = await this.getCollection().insertOne({
                ...user,
                createdAt: new Date(),
                updatedAt: new Date()
            } as IUser);

            const createdUser = await this.getCollection().findOne({ _id: result.insertedId });
            if (!createdUser) {
                throw new Error('Failed to create user');
            }

            return UserModel.toResponse(createdUser);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async findById(id: string): Promise<IUserResponse | null> {
        try {
            // Validate ObjectId format
            if (!ObjectId.isValid(id)) {
                console.error('Invalid ObjectId format:', id);
                return null;
            }

            const user = await this.getCollection().findOne({ _id: new ObjectId(id) });
            return user ? UserModel.toResponse(user) : null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw error;
        }
    }

    async findByEmail(email: string): Promise<IUser | null> {
        try {
            return await this.getCollection().findOne({ email });
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }

    async findByUsername(username: string): Promise<IUser | null> {
        try {
            return await this.getCollection().findOne({ username });
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    async findAll(page = 1, limit = 10, search?: string): Promise<{
        users: IUserResponse[];
        total: number;
        page: number;
        pages: number;
    }> {
        try {
            const skip = (page - 1) * limit;
            let filter: any = { isActive: true };

            if (search) {
                filter.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const [users, total] = await Promise.all([
                this.getCollection()
                    .find(filter)
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .toArray(),
                this.getCollection().countDocuments(filter)
            ]);

            return {
                users: users.map(user => UserModel.toResponse(user)),
                total,
                page,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error finding users:', error);
            throw error;
        }
    }

    async update(id: string, userData: IUserUpdate): Promise<IUserResponse | null> {
        try {
            // Get current user to compare changes
            const currentUser = await this.getCollection().findOne({ _id: new ObjectId(id) });
            if (!currentUser) {
                throw new Error('User not found');
            }

            // Validate email format if provided and changed
            if (userData.email && userData.email !== currentUser.email) {
                if (!this.isValidEmail(userData.email)) {
                    throw new Error('Invalid email format');
                }
            }

            // Validate username if provided and changed
            if (userData.username && userData.username !== currentUser.username) {
                if (!this.isValidUsername(userData.username)) {
                    throw new Error('Invalid username format');
                }
            }

            // Check if email already exists (excluding current user)
            if (userData.email && userData.email !== currentUser.email) {
                const existingUser = await this.getCollection().findOne({
                    email: userData.email,
                    _id: { $ne: new ObjectId(id) }
                });
                if (existingUser) {
                    throw new Error('Email already exists');
                }
            }

            // Check if username already exists (excluding current user)
            if (userData.username && userData.username !== currentUser.username) {
                const existingUser = await this.getCollection().findOne({
                    username: userData.username,
                    _id: { $ne: new ObjectId(id) }
                });
                if (existingUser) {
                    throw new Error('Username already exists');
                }
            }

            const updateData = UserModel.toUpdate(userData);

            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );

            return result ? UserModel.toResponse(result) : null;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: { isActive: false, updatedAt: new Date() } },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    async hardDelete(id: string): Promise<boolean> {
        try {
            const result = await this.getCollection().deleteOne({ _id: new ObjectId(id) });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error hard deleting user:', error);
            throw error;
        }
    }

    async validatePassword(email: string, password: string): Promise<IUser | null> {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                return null;
            }

            const isValid = await bcrypt.compare(password, user.password);
            return isValid ? user : null;
        } catch (error) {
            console.error('Error validating password:', error);
            throw error;
        }
    }

    async validatePasswordForUser(user: IUser, password: string): Promise<IUser | null> {
        try {
            if (!user) {
                return null;
            }

            const isValid = await bcrypt.compare(password, user.password);
            return isValid ? user : null;
        } catch (error) {
            console.error('Error validating password:', error);
            throw error;
        }
    }

    async updatePassword(id: string, newPassword: string): Promise<boolean> {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        password: hashedPassword,
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    async addToGroup(userId: string, groupId: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(userId) },
                {
                    $addToSet: { groups: new ObjectId(groupId) },
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error adding user to group:', error);
            throw error;
        }
    }

    async removeFromGroup(userId: string, groupId: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(userId) },
                {
                    $pull: { groups: new ObjectId(groupId) } as any,
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error removing user from group:', error);
            throw error;
        }
    }

    async updateLastLogin(id: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        lastLogin: new Date(),
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error updating last login:', error);
            throw error;
        }
    }

    // Admin methods
    async getAllUsers(options: {
        page: number;
        limit: number;
        search?: string;
    }): Promise<{
        users: IUserResponse[];
        total: number;
        page: number;
        pages: number;
    }> {
        try {
            const skip = (options.page - 1) * options.limit;
            const filter: any = {
                $and: [
                    {
                        $or: [
                            { isDeleted: { $ne: true } },
                            { isDeleted: { $exists: false } }
                        ]
                    }
                ]
            };

            if (options.search) {
                filter.$and.push({
                    $or: [
                        { username: { $regex: options.search, $options: 'i' } },
                        { email: { $regex: options.search, $options: 'i' } }
                    ]
                });
            }

            const [users, total] = await Promise.all([
                this.getCollection()
                    .find(filter)
                    .skip(skip)
                    .limit(options.limit)
                    .sort({ createdAt: -1 })
                    .toArray(),
                this.getCollection().countDocuments(filter)
            ]);

            return {
                users: users.map(user => UserModel.toResponse(user)),
                total,
                page: options.page,
                pages: Math.ceil(total / options.limit)
            };
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    async countUsers(): Promise<number> {
        try {
            // Count all users, excluding only those explicitly marked as deleted
            return await this.getCollection().countDocuments({
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ]
            });
        } catch (error) {
            console.error('Error counting users:', error);
            throw error;
        }
    }

    async countActiveUsers(): Promise<number> {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            return await this.getCollection().countDocuments({
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ],
                isActive: true,
                lastLogin: { $gte: oneWeekAgo }
            });
        } catch (error) {
            console.error('Error counting active users:', error);
            throw error;
        }
    }

    async countNewUsersThisWeek(): Promise<number> {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            return await this.getCollection().countDocuments({
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ],
                createdAt: { $gte: oneWeekAgo }
            });
        } catch (error) {
            console.error('Error counting new users this week:', error);
            throw error;
        }
    }

    async getUserGroups(userId: string): Promise<any[]> {
        try {
            // Get user to check their groups array
            const user = await this.getCollection().findOne({ _id: new ObjectId(userId) });
            if (!user) {
                throw new Error('User not found');
            }

            // If user has no groups, return empty array
            if (!user.groups || user.groups.length === 0) {
                return [];
            }

            // Query groups collection to get full group data
            const groupsCollection = mongoDB.getCollection('groups');
            const groups = await groupsCollection.find({
                _id: { $in: user.groups }
            }).toArray();

            return groups.map((group: any) => ({
                _id: group._id,
                name: group.name,
                description: group.description,
                category: group.category,
                members: group.members || [],
                admins: group.admins || [],
                isActive: group.isActive,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt
            }));
        } catch (error) {
            console.error('Error getting user groups:', error);
            throw error;
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private isValidUsername(username: string): boolean {
        // Username should be 3-30 characters, alphanumeric, spaces and underscores only
        const usernameRegex = /^[a-zA-Z0-9_\s]{3,30}$/;
        return usernameRegex.test(username);
    }
}

export const userService = new UserService();