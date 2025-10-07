import { Collection, ObjectId, Document } from 'mongodb';
import { mongoDB } from '../db/mongodb';
import { IGroup, IGroupCreate, IGroupUpdate, IGroupResponse, GroupModel } from '../models/group.model';

export class GroupService {
    private collection: Collection<IGroup> | null = null;

    constructor() {
        // Lazy initialization - will be set when first method is called
    }

    private getCollection(): Collection<IGroup> {
        if (!this.collection) {
            this.collection = mongoDB.getCollection<IGroup>('groups');
        }
        return this.collection;
    }

    async create(groupData: IGroupCreate): Promise<IGroupResponse> {
        try {
            // Check if group already exists
            const existingGroup = await this.getCollection().findOne({ name: groupData.name });
            if (existingGroup) {
                throw new Error('Group with this name already exists');
            }

            // Create group
            const group = GroupModel.toCreate(groupData);
            const result = await this.getCollection().insertOne({
                ...group,
                createdAt: new Date(),
                updatedAt: new Date()
            } as IGroup);

            const createdGroup = await this.getCollection().findOne({ _id: result.insertedId });
            if (!createdGroup) {
                throw new Error('Failed to create group');
            }

            return GroupModel.toResponse(createdGroup);
        } catch (error) {
            console.error('Error creating group:', error);
            throw error;
        }
    }

    async findById(id: string): Promise<IGroupResponse | null> {
        try {
            const group = await this.getCollection().findOne({ _id: new ObjectId(id) });
            return group ? GroupModel.toResponse(group) : null;
        } catch (error) {
            console.error('Error finding group by ID:', error);
            throw error;
        }
    }

    async findAll(page = 1, limit = 10, search?: string): Promise<{
        groups: IGroupResponse[];
        total: number;
        page: number;
        pages: number;
    }> {
        try {
            const skip = (page - 1) * limit;
            let filter: any = { isActive: true };

            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }

            const [groups, total] = await Promise.all([
                this.getCollection()
                    .find(filter)
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 })
                    .toArray(),
                this.getCollection().countDocuments(filter)
            ]);

            return {
                groups: groups.map(group => GroupModel.toResponse(group)),
                total,
                page,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            console.error('Error finding groups:', error);
            throw error;
        }
    }

    async update(id: string, groupData: IGroupUpdate): Promise<IGroupResponse | null> {
        try {
            const updateData = GroupModel.toUpdate(groupData);

            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updateData },
                { returnDocument: 'after' }
            );

            return result ? GroupModel.toResponse(result) : null;
        } catch (error) {
            console.error('Error updating group:', error);
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
            console.error('Error deleting group:', error);
            throw error;
        }
    }

    async isMember(groupId: string, userId: string): Promise<boolean> {
        try {
            const group = await this.getCollection().findOne({
                _id: new ObjectId(groupId),
                'members.userId': new ObjectId(userId)
            });

            return !!group;
        } catch (error) {
            console.error('Error checking if user is member:', error);
            throw error;
        }
    }

    async isAdmin(groupId: string, userId: string): Promise<boolean> {
        try {
            const group = await this.getCollection().findOne({
                _id: new ObjectId(groupId),
                $or: [
                    { admins: new ObjectId(userId) },
                    { 'members.userId': new ObjectId(userId), 'members.role': 'admin' }
                ]
            });

            return !!group;
        } catch (error) {
            console.error('Error checking if user is admin:', error);
            throw error;
        }
    }

    async getUserGroups(userId: string): Promise<IGroupResponse[]> {
        try {
            const groups = await this.getCollection()
                .find({
                    'members.userId': new ObjectId(userId),
                    isActive: true
                })
                .sort({ createdAt: -1 })
                .toArray();

            return groups.map(group => GroupModel.toResponse(group));
        } catch (error) {
            console.error('Error getting user groups:', error);
            throw error;
        }
    }

    async getGroupMembers(groupId: string): Promise<Array<{
        userId: string;
        username: string;
        role: 'admin' | 'member';
        joinedAt: string;
    }>> {
        try {
            const group = await this.getCollection().findOne({ _id: new ObjectId(groupId) });
            if (!group) {
                throw new Error('Group not found');
            }

            return group.members.map(member => ({
                userId: member.userId.toString(),
                username: member.username,
                role: member.role,
                joinedAt: member.joinedAt.toISOString()
            }));
        } catch (error) {
            console.error('Error getting group members:', error);
            throw error;
        }
    }

    // Admin methods
    async countGroups(): Promise<number> {
        try {
            // Count all groups, excluding only those explicitly marked as deleted
            return await this.getCollection().countDocuments({
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ]
            });
        } catch (error) {
            console.error('Error counting groups:', error);
            throw error;
        }
    }

    async countActiveGroups(): Promise<number> {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            return await this.getCollection().countDocuments({
                $or: [
                    { isDeleted: { $ne: true } },
                    { isDeleted: { $exists: false } }
                ],
                isActive: true,
                updatedAt: { $gte: oneWeekAgo }
            });
        } catch (error) {
            console.error('Error counting active groups:', error);
            throw error;
        }
    }

    // Additional methods for controllers
    async getAllGroups(options: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        category?: string;
        isPrivate?: boolean;
        sortBy?: string;
        sortOrder?: string;
    }): Promise<{
        groups: IGroupResponse[];
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
                        { name: { $regex: options.search, $options: 'i' } },
                        { description: { $regex: options.search, $options: 'i' } }
                    ]
                });
            }

            if (options.status) {
                // Handle both new documents with status field and old documents without it
                if (options.status === 'active') {
                    filter.$and.push({
                        $or: [
                            { status: 'active' },
                            { status: { $exists: false } }, // Old documents without status field
                            { status: null }
                        ]
                    });
                } else {
                    // For inactive/pending, only match documents that explicitly have these statuses
                    filter.$and.push({ status: options.status });
                }
            }

            if (options.category) {
                // Handle both new documents with category field and old documents without it
                if (options.category === 'general') {
                    filter.$and.push({
                        $or: [
                            { category: 'general' },
                            { category: { $exists: false } }, // Old documents without category field
                            { category: null }
                        ]
                    });
                } else {
                    // For specific categories, only match documents that explicitly have these categories
                    filter.$and.push({ category: options.category });
                }
            }

            if (options.isPrivate !== undefined) {
                filter.$and.push({ isPrivate: options.isPrivate });
            }

            // Build sort object
            const sortField = options.sortBy || 'createdAt';
            const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
            const sort: any = {};
            sort[sortField] = sortOrder;

            const [groups, total] = await Promise.all([
                this.getCollection()
                    .find(filter)
                    .skip(skip)
                    .limit(options.limit)
                    .sort(sort)
                    .toArray(),
                this.getCollection().countDocuments(filter)
            ]);

            return {
                groups: groups.map(group => GroupModel.toResponse(group)),
                total,
                page: options.page,
                pages: Math.ceil(total / options.limit)
            };
        } catch (error) {
            console.error('Error getting all groups:', error);
            throw error;
        }
    }

    async getGroupById(id: string): Promise<IGroupResponse | null> {
        return this.findById(id);
    }

    async createGroup(groupData: IGroupCreate): Promise<IGroupResponse> {
        return this.create(groupData);
    }

    async updateGroup(id: string, groupData: IGroupUpdate): Promise<IGroupResponse | null> {
        return this.update(id, groupData);
    }

    async deleteGroup(id: string): Promise<boolean> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedAt: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            return !!result;
        } catch (error) {
            console.error('Error deleting group:', error);
            throw error;
        }
    }

    async addMember(groupId: string, userId: string, username: string): Promise<IGroupResponse | null> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(groupId) },
                {
                    $addToSet: {
                        members: {
                            userId: new ObjectId(userId),
                            username: username,
                            role: 'member',
                            joinedAt: new Date()
                        }
                    },
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return result ? GroupModel.toResponse(result) : null;
        } catch (error) {
            console.error('Error adding member:', error);
            throw error;
        }
    }

    async removeMember(groupId: string, userId: string): Promise<IGroupResponse | null> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(groupId) },
                {
                    $pull: {
                        members: { userId: new ObjectId(userId) }
                    } as any,
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return result ? GroupModel.toResponse(result) : null;
        } catch (error) {
            console.error('Error removing member:', error);
            throw error;
        }
    }

    async addAdmin(groupId: string, userId: string): Promise<IGroupResponse | null> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(groupId) },
                {
                    $addToSet: {
                        admins: new ObjectId(userId)
                    },
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return result ? GroupModel.toResponse(result) : null;
        } catch (error) {
            console.error('Error adding admin:', error);
            throw error;
        }
    }

    async removeAdmin(groupId: string, userId: string): Promise<IGroupResponse | null> {
        try {
            const result = await this.getCollection().findOneAndUpdate(
                { _id: new ObjectId(groupId) },
                {
                    $pull: {
                        admins: new ObjectId(userId)
                    } as any,
                    $set: { updatedAt: new Date() }
                },
                { returnDocument: 'after' }
            );

            return result ? GroupModel.toResponse(result) : null;
        } catch (error) {
            console.error('Error removing admin:', error);
            throw error;
        }
    }
}

export const groupService = new GroupService();