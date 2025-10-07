import { userService } from './user.service';
import { groupService } from './group.service';
import { channelService } from './channel.service';
import { messageService } from './message.service';

export interface ClientProfile {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
    roles: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ClientSettings {
    notifications: {
        email: boolean;
        push: boolean;
        sound: boolean;
    };
    privacy: {
        showOnlineStatus: boolean;
        allowDirectMessages: boolean;
    };
    appearance: {
        theme: 'light' | 'dark';
        fontSize: 'small' | 'medium' | 'large';
    };
}

export interface Notification {
    _id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

export class ClientService {
    /**
     * Get client profile
     */
    async getProfile(userId: string): Promise<ClientProfile> {
        try {
            const user = await userService.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            return {
                _id: user._id!,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatar,
                roles: user.roles,
                isActive: user.isActive,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt)
            };
        } catch (error) {
            console.error('Error getting profile:', error);
            throw error;
        }
    }

    /**
     * Update client profile
     */
    async updateProfile(userId: string, updateData: Partial<ClientProfile>): Promise<ClientProfile> {
        try {
            const user = await userService.update(userId, updateData);
            if (!user) {
                throw new Error('User not found');
            }

            return {
                _id: user._id!,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatar,
                roles: user.roles,
                isActive: user.isActive,
                createdAt: new Date(user.createdAt),
                updatedAt: new Date(user.updatedAt)
            };
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    /**
     * Get client groups
     */
    async getGroups(userId: string) {
        try {
            return await userService.getUserGroups(userId);
        } catch (error) {
            console.error('Error getting groups:', error);
            throw error;
        }
    }

    /**
     * Get client channels
     */
    async getChannels(userId: string, groupId?: string) {
        try {
            if (groupId) {
                return await channelService.getChannelsByGroup(groupId);
            }

            // Get all channels for user's groups
            const userGroups = await userService.getUserGroups(userId);
            const allChannels = [];

            for (const group of userGroups) {
                const channels = await channelService.getChannelsByGroup(group._id!);
                allChannels.push(...channels);
            }

            return allChannels;
        } catch (error) {
            console.error('Error getting channels:', error);
            throw error;
        }
    }

    /**
     * Get client messages
     */
    async getMessages(userId: string, channelId: string, limit: number, offset: number) {
        try {
            // Verify user has access to channel
            const channel = await channelService.getChannelById(channelId);
            if (!channel) {
                throw new Error('Channel not found');
            }

            // Check if user is member of the group that owns this channel
            const userGroups = await userService.getUserGroups(userId);
            const hasAccess = userGroups.some(group => group._id === channel.groupId);

            if (!hasAccess) {
                throw new Error('Access denied to channel');
            }

            return await messageService.getMessagesByChannel(channelId, limit, offset);
        } catch (error) {
            console.error('Error getting messages:', error);
            throw error;
        }
    }

    /**
     * Get client notifications
     */
    async getNotifications(userId: string, limit: number, offset: number): Promise<Notification[]> {
        try {
            // TODO: Implement notification system
            return [];
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(userId: string, notificationId: string): Promise<Notification | null> {
        try {
            // TODO: Implement notification system
            return null;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Get client settings
     */
    async getSettings(userId: string): Promise<ClientSettings> {
        try {
            // TODO: Implement settings storage
            return {
                notifications: {
                    email: true,
                    push: true,
                    sound: true
                },
                privacy: {
                    showOnlineStatus: true,
                    allowDirectMessages: true
                },
                appearance: {
                    theme: 'light',
                    fontSize: 'medium'
                }
            };
        } catch (error) {
            console.error('Error getting settings:', error);
            throw error;
        }
    }

    /**
     * Update client settings
     */
    async updateSettings(userId: string, settings: Partial<ClientSettings>): Promise<ClientSettings> {
        try {
            // TODO: Implement settings storage
            const currentSettings = await this.getSettings(userId);
            const updatedSettings = { ...currentSettings, ...settings };

            // TODO: Save to database

            return updatedSettings;
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }
}

export const clientService = new ClientService();
