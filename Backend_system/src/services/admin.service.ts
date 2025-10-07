import { userService } from './user.service';
import { groupService } from './group.service';
import { channelService } from './channel.service';
import { messageService } from './message.service';

export interface DashboardStats {
    totalUsers: number;
    totalGroups: number;
    totalChannels: number;
    totalMessages: number;
    activeUsers: number;
    newUsersThisWeek: number;
    messagesToday: number;
    messagesThisWeek: number;
    recentActivity: any[];
}

export interface SystemStats {
    users: {
        total: number;
        active: number;
        inactive: number;
        newThisWeek: number;
    };
    groups: {
        totalGroups: number;
        activeGroups: number;
        privateGroups: number;
        publicGroups: number;
        averageMembersPerGroup: number;
    };
    channels: {
        totalChannels: number;
        activeChannels: number;
        textChannels: number;
        voiceChannels: number;
        videoChannels: number;
        averageMessagesPerChannel: number;
    };
    messages: {
        total: number;
        today: number;
        thisWeek: number;
    };
    storage: {
        totalFiles: number;
        totalSize: number;
    };
    // Additional fields for frontend compatibility
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
    activeConnections: number;
}

export interface UserActivity {
    _id: string;
    userId: string;
    action: string;
    details: any;
    timestamp: Date;
}

export class AdminService {
    /**
     * Get dashboard statistics
     */
    async getDashboardStats(): Promise<DashboardStats> {
        try {
            const [totalUsers, totalGroups, totalChannels, totalMessages, activeUsers, newUsersThisWeek, messagesToday, messagesThisWeek] = await Promise.all([
                userService.countUsers(),
                groupService.countGroups(),
                channelService.countChannels(),
                messageService.countMessages(),
                userService.countActiveUsers(),
                userService.countNewUsersThisWeek(),
                messageService.countMessagesToday(),
                messageService.countMessagesThisWeek()
            ]);

            const recentActivity = await this.getRecentActivity();

            return {
                totalUsers,
                totalGroups,
                totalChannels,
                totalMessages,
                activeUsers,
                newUsersThisWeek,
                messagesToday,
                messagesThisWeek,
                recentActivity
            };
        } catch (error) {
            console.error('Error getting dashboard stats:', error);
            throw error;
        }
    }

    /**
     * Get all users with pagination and search
     */
    async getAllUsers(options: {
        page: number;
        limit: number;
        search?: string;
    }) {
        try {
            return await userService.getAllUsers(options);
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    /**
     * Create user
     */
    async createUser(userData: {
        username: string;
        email: string;
        password: string;
        roles: string[];
    }) {
        try {
            return await userService.create(userData);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Update user (Super Admin only)
     */
    async updateUser(userId: string, userData: {
        username?: string;
        email?: string;
        roles?: string[];
        isActive?: boolean;
    }): Promise<any> {
        try {
            const updateData: any = {};

            if (userData.username) updateData.username = userData.username;
            if (userData.email) updateData.email = userData.email;
            if (userData.roles) updateData.roles = userData.roles;
            if (userData.isActive !== undefined) updateData.isActive = userData.isActive;

            const user = await userService.update(userId, updateData);
            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Delete user
     */
    async deleteUser(userId: string) {
        try {
            return await userService.hardDelete(userId);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Bulk delete users (Super Admin only)
     */
    async bulkDeleteUsers(userIds: string[]): Promise<number> {
        try {
            let deletedCount = 0;
            for (const userId of userIds) {
                const deleted = await userService.hardDelete(userId);
                if (deleted) deletedCount++;
            }
            return deletedCount;
        } catch (error) {
            console.error('Error bulk deleting users:', error);
            throw error;
        }
    }

    /**
     * Bulk update users (Super Admin only)
     */
    async bulkUpdateUsers(userIds: string[], updates: {
        isActive?: boolean;
        roles?: string[];
    }): Promise<number> {
        try {
            let updatedCount = 0;
            for (const userId of userIds) {
                const user = await userService.update(userId, updates);
                if (user) updatedCount++;
            }
            return updatedCount;
        } catch (error) {
            console.error('Error bulk updating users:', error);
            throw error;
        }
    }

    /**
     * Get system statistics
     */
    async getSystemStats(): Promise<SystemStats> {
        try {
            const [users, groups, channels, messages] = await Promise.all([
                this.getUserStatsForSystem(),
                this.getGroupStats(),
                this.getChannelStats(),
                this.getMessageStats()
            ]);

            return {
                users,
                groups,
                channels,
                messages,
                storage: {
                    totalFiles: 0, // TODO: Implement file counting
                    totalSize: 0   // TODO: Implement size calculation
                },
                // Mock system resource data for frontend compatibility
                memoryUsage: 0,
                cpuUsage: 0,
                diskUsage: 0,
                activeConnections: 0
            };
        } catch (error) {
            console.error('Error getting system stats:', error);
            throw error;
        }
    }

    /**
     * Get user activity logs
     */
    async getUserActivity(userId: string, limit: number, offset: number): Promise<UserActivity[]> {
        try {
            // TODO: Implement user activity logging
            return [];
        } catch (error) {
            console.error('Error getting user activity:', error);
            throw error;
        }
    }

    /**
     * Get group statistics
     */
    async getGroupStats() {
        try {
            const total = await groupService.countGroups();
            const active = await groupService.countActiveGroups();

            return {
                totalGroups: total,
                activeGroups: active,
                privateGroups: 0, // TODO: Implement private group counting
                publicGroups: total, // TODO: Implement public group counting
                averageMembersPerGroup: 0 // TODO: Implement average calculation
            };
        } catch (error) {
            console.error('Error getting group stats:', error);
            throw error;
        }
    }

    /**
     * Get channel statistics
     */
    async getChannelStats() {
        try {
            const total = await channelService.countChannels();
            const active = await channelService.countActiveChannels();

            return {
                totalChannels: total,
                activeChannels: active,
                textChannels: total, // TODO: Implement channel type counting
                voiceChannels: 0, // TODO: Implement channel type counting
                videoChannels: 0, // TODO: Implement channel type counting
                averageMessagesPerChannel: 0 // TODO: Implement average calculation
            };
        } catch (error) {
            console.error('Error getting channel stats:', error);
            throw error;
        }
    }

    /**
     * Get user statistics (private method for system stats)
     */
    private async getUserStatsForSystem() {
        try {
            const total = await userService.countUsers();
            const active = await userService.countActiveUsers();
            const newThisWeek = await userService.countNewUsersThisWeek();

            return {
                total,
                active,
                inactive: total - active,
                newThisWeek
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    /**
     * Get message statistics
     */
    private async getMessageStats() {
        try {
            const total = await messageService.countMessages();
            const today = await messageService.countMessagesToday();
            const thisWeek = await messageService.countMessagesThisWeek();

            return {
                total,
                today,
                thisWeek
            };
        } catch (error) {
            console.error('Error getting message stats:', error);
            throw error;
        }
    }

    /**
     * Get recent activity
     */
    private async getRecentActivity() {
        try {
            // TODO: Implement recent activity tracking
            return [];
        } catch (error) {
            console.error('Error getting recent activity:', error);
            throw error;
        }
    }

    /**
     * Get all groups (Admin only)
     */
    async getAllGroups(options: {
        page: number;
        limit: number;
        search?: string;
        status?: string;
        category?: string;
    }): Promise<{
        groups: any[];
        total: number;
        page: number;
        pages: number;
    }> {
        try {
            return await groupService.getAllGroups(options);
        } catch (error) {
            console.error('Error getting all groups:', error);
            throw error;
        }
    }

    /**
     * Get all channels (Admin only)
     */
    async getAllChannels(): Promise<any[]> {
        try {
            return await channelService.getAllChannels();
        } catch (error) {
            console.error('Error getting all channels:', error);
            throw error;
        }
    }

    /**
     * Get user groups (Admin only)
     */
    async getUserGroups(userId: string): Promise<any[]> {
        try {
            return await userService.getUserGroups(userId);
        } catch (error) {
            console.error('Error getting user groups:', error);
            throw error;
        }
    }

    /**
     * Get user statistics (Admin only)
     */
    async getUserStats(): Promise<any> {
        try {
            const totalUsers = await userService.countUsers();
            const activeUsers = await userService.countActiveUsers();
            const newUsersThisWeek = await userService.countNewUsersThisWeek();

            // Count users by role
            const allUsers = await userService.getAllUsers({ page: 1, limit: 1000 });
            const superAdmins = allUsers.users.filter(user => user.roles?.includes('super_admin')).length;
            const groupAdmins = allUsers.users.filter(user => user.roles?.includes('group_admin')).length;

            return {
                totalUsers,
                activeUsers,
                newUsersThisWeek,
                superAdmins,
                groupAdmins,
                inactiveUsers: totalUsers - activeUsers
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }
}

export const adminService = new AdminService();
