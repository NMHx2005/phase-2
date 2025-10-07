import { ObjectId, Document } from 'mongodb';

export interface IUser extends Document {
    _id?: ObjectId;
    username: string;
    email: string;
    password: string;
    roles: string[];
    groups: ObjectId[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
    avatar?: string;
    bio?: string;
    phone?: string;
    address?: string;
}

export interface IUserCreate {
    username: string;
    email: string;
    password: string;
    roles?: string[];
    groups?: ObjectId[];
    isActive?: boolean;
    avatar?: string;
    bio?: string;
    phone?: string;
    address?: string;
}

export interface IUserUpdate {
    username?: string;
    email?: string;
    password?: string;
    roles?: string[];
    groups?: ObjectId[];
    isActive?: boolean;
    avatar?: string;
    bio?: string;
    phone?: string;
    address?: string;
    lastLogin?: Date;
}

export interface IUserResponse {
    _id: string;
    username: string;
    email: string;
    roles: string[];
    groups: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    avatar?: string;
    bio?: string;
    phone?: string;
    address?: string;
}

export class UserModel {
    static toResponse(user: IUser): IUserResponse {
        return {
            _id: user._id?.toString() || '',
            username: user.username,
            email: user.email,
            roles: user.roles,
            groups: user.groups?.map(id => id.toString()) || [],
            isActive: user.isActive,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            lastLogin: user.lastLogin?.toISOString(),
            avatar: user.avatar,
            bio: user.bio,
            phone: user.phone,
            address: user.address
        };
    }

    static toCreate(data: IUserCreate): Omit<IUser, '_id' | 'createdAt' | 'updatedAt'> {
        return {
            username: data.username,
            email: data.email,
            password: data.password,
            roles: data.roles || ['user'],
            groups: data.groups || [],
            isActive: data.isActive !== undefined ? data.isActive : true,
            avatar: data.avatar,
            bio: data.bio,
            phone: data.phone,
            address: data.address
        };
    }

    static toUpdate(data: IUserUpdate): Partial<IUser> {
        const update: Partial<IUser> = {};

        if (data.username !== undefined) update.username = data.username;
        if (data.email !== undefined) update.email = data.email;
        if (data.password !== undefined) update.password = data.password;
        if (data.roles !== undefined) update.roles = data.roles;
        if (data.groups !== undefined) update.groups = data.groups;
        if (data.isActive !== undefined) update.isActive = data.isActive;
        if (data.avatar !== undefined) update.avatar = data.avatar;
        if (data.bio !== undefined) update.bio = data.bio;
        if (data.phone !== undefined) update.phone = data.phone;
        if (data.address !== undefined) update.address = data.address;
        if (data.lastLogin !== undefined) update.lastLogin = data.lastLogin;

        update.updatedAt = new Date();

        return update;
    }
}

export { IUser as User };