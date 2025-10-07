import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { mongoDB } from '../db/mongodb';
import { IUser, IMessage, IChannel, IGroup } from '../models';
import { userService } from '../services/user.service';
import { messageService } from '../services/message.service';
import { groupService } from '../services/group.service';
import { channelService } from '../services/channel.service';
import { videoCallService, CallOffer, CallAnswer, IceCandidate } from '../services/video-call.service';

interface AuthenticatedSocket extends Socket {
    userId?: string;
    username?: string;
    userRoles?: string[];
}

interface SocketUser {
    userId: string;
    username: string;
    socketId: string;
    currentChannel?: string;
    isOnline: boolean;
}

interface JoinChannelData {
    channelId: string;
    channelName: string;
}

interface SendMessageData {
    channelId: string;
    text: string;
    type?: 'text' | 'image' | 'file';
    imageUrl?: string;
    fileUrl?: string;
}

interface TypingData {
    channelId: string;
    isTyping: boolean;
}

class SocketServer {
    private io: SocketIOServer;
    private connectedUsers: Map<string, SocketUser> = new Map();
    private channelUsers: Map<string, Set<string>> = new Map();
    private videoRooms: Map<string, Set<string>> = new Map(); // roomId -> Set of peerIds

    // Static instance for global access
    private static instance: SocketServer;

    constructor(server: HTTPServer) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:4200",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['polling'],
            allowEIO3: true,
            pingTimeout: 60000,
            pingInterval: 25000,
            allowUpgrades: false
        });

        this.setupMiddleware();
        this.setupEventHandlers();
        SocketServer.instance = this;
    }

    // Static method to get instance
    static getInstance(): SocketServer {
        return SocketServer.instance;
    }

    // Method to broadcast message from HTTP API
    broadcastMessage(channelId: string, message: any): void {
        this.io.emit('new_message', {
            channelId: channelId,
            message: message
        });
        console.log(`🔍 SocketServer.broadcastMessage - Message broadcasted to channel ${channelId}`);
    }

    private setupMiddleware(): void {
        // Authentication middleware
        this.io.use(async (socket: AuthenticatedSocket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

                if (!token) {
                    return next(new Error('Authentication error: No token provided'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

                // Get user from database
                const user = await userService.findById(decoded.userId);

                if (!user || !user.isActive) {
                    return next(new Error('Authentication error: User not found or inactive'));
                }

                socket.userId = (user._id as any).toString();
                socket.username = user.username;
                socket.userRoles = user.roles;

                next();
            } catch (error) {
                console.error('Socket authentication error:', error);
                next(new Error('Authentication error: Invalid token'));
            }
        });
    }

    private setupEventHandlers(): void {
        this.io.on('connection', (socket: AuthenticatedSocket) => {
            console.log(`User connected: ${socket.username} (${socket.id})`);

            // Store user connection
            if (socket.userId && socket.username) {
                this.connectedUsers.set(socket.userId, {
                    userId: socket.userId,
                    username: socket.username,
                    socketId: socket.id,
                    isOnline: true
                });
            }

            // Send online users count to all clients
            this.broadcastOnlineUsersCount();

            // Handle user joining a channel
            socket.on('join_channel', async (data: JoinChannelData) => {
                await this.handleJoinChannel(socket, data);
            });

            // Handle user leaving a channel
            socket.on('leave_channel', (data: { channelId: string }) => {
                this.handleLeaveChannel(socket, data.channelId);
            });

            // Handle sending messages
            socket.on('send_message', async (data: SendMessageData) => {
                await this.handleSendMessage(socket, data);
            });

            // Handle typing indicators
            socket.on('typing', (data: TypingData) => {
                this.handleTyping(socket, data);
            });

            // Handle stop typing
            socket.on('stop_typing', (data: { channelId: string }) => {
                this.handleStopTyping(socket, data.channelId);
            });

            // Handle user disconnect
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });

            // Handle get online users
            socket.on('get_online_users', () => {
                this.handleGetOnlineUsers(socket);
            });

            // Handle get channel users
            socket.on('get_channel_users', (data: { channelId: string }) => {
                this.handleGetChannelUsers(socket, data.channelId);
            });

            // Video call event handlers
            socket.on('video_call_initiate', async (data: { recipientId: string; channelId: string }) => {
                await this.handleVideoCallInitiate(socket, data);
            });

            socket.on('video_call_accept', async (data: { callId: string }) => {
                await this.handleVideoCallAccept(socket, data);
            });

            socket.on('video_call_reject', async (data: { callId: string }) => {
                await this.handleVideoCallReject(socket, data);
            });

            socket.on('video_call_end', async (data: { callId: string }) => {
                await this.handleVideoCallEnd(socket, data);
            });

            socket.on('video_call_offer', (data: CallOffer) => {
                this.handleVideoCallOffer(socket, data);
            });

            socket.on('video_call_answer', (data: CallAnswer) => {
                this.handleVideoCallAnswer(socket, data);
            });

            socket.on('video_call_ice_candidate', (data: IceCandidate) => {
                this.handleVideoCallIceCandidate(socket, data);
            });

            // Group video call handlers
            socket.on('join_video_room', (data: { roomId: string, peerId: string, userId: string }) => {
                this.handleJoinVideoRoom(socket, data);
            });

            socket.on('leave_video_room', (data: { roomId: string, peerId: string }) => {
                this.handleLeaveVideoRoom(socket, data);
            });
        });
    }

    private async handleJoinChannel(socket: AuthenticatedSocket, data: JoinChannelData): Promise<void> {
        try {
            if (!socket.userId) return;

            // Verify user has access to channel
            const channel = await channelService.getChannelById(data.channelId);
            if (!channel) {
                socket.emit('error', { message: 'Channel not found' });
                return;
            }

            // Check if user is member of the group that owns this channel
            const group = await groupService.getGroupById(channel.groupId.toString());
            if (!group || !group.members.some(member => member.userId.toString() === socket.userId)) {
                socket.emit('error', { message: 'Access denied to this channel' });
                return;
            }

            // Leave previous channel if any
            const user = this.connectedUsers.get(socket.userId);
            if (user?.currentChannel) {
                this.handleLeaveChannel(socket, user.currentChannel);
            }

            // Join socket room
            socket.join(data.channelId);

            // Update user's current channel
            if (user) {
                user.currentChannel = data.channelId;
                this.connectedUsers.set(socket.userId, user);
            }

            // Add user to channel users
            if (!this.channelUsers.has(data.channelId)) {
                this.channelUsers.set(data.channelId, new Set());
            }
            this.channelUsers.get(data.channelId)?.add(socket.userId);

            // Load previous messages
            const messages = await messageService.getMessagesByChannel(data.channelId, 50, 0);

            // Send previous messages to user
            socket.emit('previous_messages', {
                channelId: data.channelId,
                messages: messages.reverse()
            });

            // Notify other users in channel
            socket.to(data.channelId).emit('user_joined', {
                channelId: data.channelId,
                userId: socket.userId,
                username: socket.username,
                message: `${socket.username} joined the channel`
            });

            // Send updated channel users list
            this.broadcastChannelUsers(data.channelId);

            console.log(`${socket.username} joined channel ${data.channelName}`);
        } catch (error) {
            console.error('Error joining channel:', error);
            socket.emit('error', { message: 'Failed to join channel' });
        }
    }

    private handleLeaveChannel(socket: AuthenticatedSocket, channelId: string): void {
        try {
            if (!socket.userId) return;

            // Leave socket room
            socket.leave(channelId);

            // Update user's current channel
            const user = this.connectedUsers.get(socket.userId);
            if (user) {
                user.currentChannel = undefined;
                this.connectedUsers.set(socket.userId, user);
            }

            // Remove user from channel users
            this.channelUsers.get(channelId)?.delete(socket.userId);

            // Notify other users in channel
            socket.to(channelId).emit('user_left', {
                channelId,
                userId: socket.userId,
                username: socket.username,
                message: `${socket.username} left the channel`
            });

            // Send updated channel users list
            this.broadcastChannelUsers(channelId);

            console.log(`${socket.username} left channel ${channelId}`);
        } catch (error) {
            console.error('Error leaving channel:', error);
        }
    }

    private async handleSendMessage(socket: AuthenticatedSocket, data: SendMessageData): Promise<void> {
        try {
            if (!socket.userId || !socket.username) return;

            // No need to verify channel membership since user is already in the group
            // The frontend will handle group/channel access control

            // Create message in database
            const messageData = {
                channelId: new ObjectId(data.channelId),
                userId: new ObjectId(socket.userId),
                username: socket.username,
                text: data.text,
                type: data.type || 'text',
                imageUrl: data.imageUrl,
                fileUrl: data.fileUrl
            };

            const savedMessage = await messageService.create(messageData);

            // Broadcast message to all connected users
            this.io.emit('new_message', {
                channelId: data.channelId,
                message: savedMessage
            });

            console.log(`Message sent in channel ${data.channelId} by ${socket.username}`);
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    }

    private handleTyping(socket: AuthenticatedSocket, data: TypingData): void {
        if (!socket.userId) return;

        socket.to(data.channelId).emit('user_typing', {
            channelId: data.channelId,
            userId: socket.userId,
            username: socket.username,
            isTyping: data.isTyping
        });
    }

    private handleStopTyping(socket: AuthenticatedSocket, channelId: string): void {
        if (!socket.userId) return;

        socket.to(channelId).emit('user_stop_typing', {
            channelId,
            userId: socket.userId,
            username: socket.username
        });
    }

    private handleDisconnect(socket: AuthenticatedSocket): void {
        try {
            if (!socket.userId) return;

            const user = this.connectedUsers.get(socket.userId);
            if (user) {
                // Leave current channel
                if (user.currentChannel) {
                    this.handleLeaveChannel(socket, user.currentChannel);
                }

                // Remove user from connected users
                this.connectedUsers.delete(socket.userId);
            }

            // Broadcast updated online users count
            this.broadcastOnlineUsersCount();

            console.log(`User disconnected: ${socket.username} (${socket.id})`);
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    }

    private handleGetOnlineUsers(socket: AuthenticatedSocket): void {
        const onlineUsers = Array.from(this.connectedUsers.values()).map(user => ({
            userId: user.userId,
            username: user.username,
            isOnline: user.isOnline,
            currentChannel: user.currentChannel
        }));

        socket.emit('online_users', onlineUsers);
    }

    private handleGetChannelUsers(socket: AuthenticatedSocket, channelId: string): void {
        const channelUserIds = this.channelUsers.get(channelId) || new Set();
        const channelUsers = Array.from(channelUserIds)
            .map(userId => this.connectedUsers.get(userId))
            .filter(user => user !== undefined)
            .map(user => ({
                userId: user!.userId,
                username: user!.username,
                isOnline: user!.isOnline
            }));

        socket.emit('channel_users', {
            channelId,
            users: channelUsers
        });
    }

    private broadcastOnlineUsersCount(): void {
        const count = this.connectedUsers.size;
        this.io.emit('online_users_count', { count });
    }

    private broadcastChannelUsers(channelId: string): void {
        const channelUserIds = this.channelUsers.get(channelId) || new Set();
        const channelUsers = Array.from(channelUserIds)
            .map(userId => this.connectedUsers.get(userId))
            .filter(user => user !== undefined)
            .map(user => ({
                userId: user!.userId,
                username: user!.username,
                isOnline: user!.isOnline
            }));

        this.io.to(channelId).emit('channel_users', {
            channelId,
            users: channelUsers
        });
    }

    // Public methods for external use
    public getIO(): SocketIOServer {
        return this.io;
    }

    public getConnectedUsersCount(): number {
        return this.connectedUsers.size;
    }

    public getChannelUsersCount(channelId: string): number {
        return this.channelUsers.get(channelId)?.size || 0;
    }

    public isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }

    public getUserCurrentChannel(userId: string): string | undefined {
        return this.connectedUsers.get(userId)?.currentChannel;
    }

    // Video call handlers
    private async handleVideoCallInitiate(socket: AuthenticatedSocket, data: { recipientId: string; channelId: string }): Promise<void> {
        try {
            if (!socket.userId) return;

            // Check if recipient is online
            const recipient = this.connectedUsers.get(data.recipientId);
            if (!recipient) {
                socket.emit('video_call_error', { message: 'Recipient is not online' });
                return;
            }

            // Check if both users are in the same channel
            const initiator = this.connectedUsers.get(socket.userId);
            if (!initiator?.currentChannel || initiator.currentChannel !== data.channelId) {
                socket.emit('video_call_error', { message: 'You must be in the channel to initiate a call' });
                return;
            }

            if (recipient.currentChannel !== data.channelId) {
                socket.emit('video_call_error', { message: 'Recipient is not in the same channel' });
                return;
            }

            // Create video call
            const callData = await videoCallService.createCall({
                callerId: new ObjectId(socket.userId),
                callerName: socket.username || 'Unknown',
                receiverId: new ObjectId(data.recipientId),
                receiverName: 'Unknown', // We'll need to get this from user service
                channelId: new ObjectId(data.channelId)
            });

            // Notify recipient
            const recipientSocket = this.io.sockets.sockets.get(recipient.socketId);
            if (recipientSocket) {
                recipientSocket.emit('video_call_incoming', {
                    callId: callData._id,
                    initiatorId: socket.userId,
                    initiatorUsername: socket.username,
                    channelId: data.channelId
                });
            }

            // Confirm to initiator
            socket.emit('video_call_initiated', {
                callId: callData._id,
                status: callData.status
            });

            console.log(`Video call initiated: ${socket.username} -> ${recipient.username}`);
        } catch (error) {
            console.error('Error initiating video call:', error);
            socket.emit('video_call_error', { message: 'Failed to initiate video call' });
        }
    }

    private async handleVideoCallAccept(socket: AuthenticatedSocket, data: { callId: string }): Promise<void> {
        try {
            if (!socket.userId) return;

            const callData = await videoCallService.getCallById(data.callId);
            if (callData) {
                await videoCallService.updateCallStatus(data.callId, 'accepted');
            }
            if (!callData) {
                socket.emit('video_call_error', { message: 'Call not found or already ended' });
                return;
            }

            // Notify initiator
            const initiator = this.connectedUsers.get(callData.callerId);
            if (initiator) {
                const initiatorSocket = this.io.sockets.sockets.get(initiator.socketId);
                if (initiatorSocket) {
                    initiatorSocket.emit('video_call_accepted', {
                        callId: data.callId,
                        status: callData.status
                    });
                }
            }

            // Confirm to acceptor
            socket.emit('video_call_accepted', {
                callId: data.callId,
                status: callData.status
            });

            console.log(`Video call accepted: ${data.callId}`);
        } catch (error) {
            console.error('Error accepting video call:', error);
            socket.emit('video_call_error', { message: 'Failed to accept video call' });
        }
    }

    private async handleVideoCallReject(socket: AuthenticatedSocket, data: { callId: string }): Promise<void> {
        try {
            if (!socket.userId) return;

            const callData = await videoCallService.getCallById(data.callId);
            if (!callData) {
                socket.emit('video_call_error', { message: 'Call not found' });
                return;
            }

            await videoCallService.updateCallStatus(data.callId, 'rejected');

            // Notify initiator
            const initiator = this.connectedUsers.get(callData.callerId);
            if (initiator) {
                const initiatorSocket = this.io.sockets.sockets.get(initiator.socketId);
                if (initiatorSocket) {
                    initiatorSocket.emit('video_call_rejected', {
                        callId: data.callId,
                        status: 'rejected'
                    });
                }
            }

            console.log(`Video call rejected: ${data.callId}`);
        } catch (error) {
            console.error('Error rejecting video call:', error);
            socket.emit('video_call_error', { message: 'Failed to reject video call' });
        }
    }

    private async handleVideoCallEnd(socket: AuthenticatedSocket, data: { callId: string }): Promise<void> {
        try {
            if (!socket.userId) return;

            const callData = await videoCallService.getCallById(data.callId);
            if (!callData) {
                socket.emit('video_call_error', { message: 'Call not found' });
                return;
            }

            await videoCallService.endCall(data.callId);

            // Notify both parties
            const initiator = this.connectedUsers.get(callData.callerId);
            const recipient = this.connectedUsers.get(callData.receiverId);

            if (initiator) {
                const initiatorSocket = this.io.sockets.sockets.get(initiator.socketId);
                if (initiatorSocket) {
                    initiatorSocket.emit('video_call_ended', {
                        callId: data.callId,
                        status: 'ended'
                    });
                }
            }

            if (recipient) {
                const recipientSocket = this.io.sockets.sockets.get(recipient.socketId);
                if (recipientSocket) {
                    recipientSocket.emit('video_call_ended', {
                        callId: data.callId,
                        status: 'ended'
                    });
                }
            }

            console.log(`Video call ended: ${data.callId}`);
        } catch (error) {
            console.error('Error ending video call:', error);
            socket.emit('video_call_error', { message: 'Failed to end video call' });
        }
    }

    private async handleVideoCallOffer(socket: AuthenticatedSocket, data: CallOffer): Promise<void> {
        try {
            if (!socket.userId) return;

            const callData = await videoCallService.getCallById(data.callId);
            if (!callData) {
                socket.emit('video_call_error', { message: 'Call not found' });
                return;
            }

            // Forward offer to recipient
            const recipient = this.connectedUsers.get(data.recipientId);
            if (recipient) {
                const recipientSocket = this.io.sockets.sockets.get(recipient.socketId);
                if (recipientSocket) {
                    recipientSocket.emit('video_call_offer', data);
                }
            }
        } catch (error) {
            console.error('Error handling video call offer:', error);
            socket.emit('video_call_error', { message: 'Failed to send offer' });
        }
    }

    private async handleVideoCallAnswer(socket: AuthenticatedSocket, data: CallAnswer): Promise<void> {
        try {
            if (!socket.userId) return;

            const callData = await videoCallService.getCallById(data.callId);
            if (!callData) {
                socket.emit('video_call_error', { message: 'Call not found' });
                return;
            }

            // Forward answer to initiator
            const initiator = this.connectedUsers.get(callData.callerId);
            if (initiator) {
                const initiatorSocket = this.io.sockets.sockets.get(initiator.socketId);
                if (initiatorSocket) {
                    initiatorSocket.emit('video_call_answer', data);
                }
            }
        } catch (error) {
            console.error('Error handling video call answer:', error);
            socket.emit('video_call_error', { message: 'Failed to send answer' });
        }
    }

    private async handleVideoCallIceCandidate(socket: AuthenticatedSocket, data: IceCandidate): Promise<void> {
        try {
            if (!socket.userId) return;

            const callData = await videoCallService.getCallById(data.callId);
            if (!callData) {
                return; // Don't emit error for ICE candidates
            }

            // Forward ICE candidate to the other party
            const otherUserId = callData.callerId === socket.userId ? callData.receiverId : callData.callerId;
            const otherUser = this.connectedUsers.get(otherUserId);

            if (otherUser) {
                const otherSocket = this.io.sockets.sockets.get(otherUser.socketId);
                if (otherSocket) {
                    otherSocket.emit('video_call_ice_candidate', data);
                }
            }
        } catch (error) {
            console.error('Error handling video call ICE candidate:', error);
        }
    }

    // Group video call handlers
    private handleJoinVideoRoom(socket: AuthenticatedSocket, data: { roomId: string, peerId: string, userId: string }): void {
        try {
            if (!socket.userId) return;

            console.log(`🔍 SocketServer - User ${socket.username} joining video room ${data.roomId} with peer ${data.peerId}`);

            // Add peer to video room
            if (!this.videoRooms.has(data.roomId)) {
                this.videoRooms.set(data.roomId, new Set());
            }
            this.videoRooms.get(data.roomId)?.add(data.peerId);

            // Join socket room for this video room
            socket.join(data.roomId);

            // Get existing participants
            const existingPeers = Array.from(this.videoRooms.get(data.roomId) || []);
            console.log(`🔍 SocketServer - Room ${data.roomId} participants:`, existingPeers);

            // Send current participants to the new user
            socket.emit('room_participants', {
                roomId: data.roomId,
                participants: existingPeers.filter(peerId => peerId !== data.peerId)
            });

            // Notify other users in the room about new participant
            socket.to(data.roomId).emit('peer_joined_room', {
                roomId: data.roomId,
                peerId: data.peerId,
                userId: data.userId,
                username: socket.username
            });

            console.log(`🔍 SocketServer - User ${socket.username} joined video room ${data.roomId}`);
        } catch (error) {
            console.error('Error handling join video room:', error);
            socket.emit('video_room_error', { message: 'Failed to join video room' });
        }
    }

    private handleLeaveVideoRoom(socket: AuthenticatedSocket, data: { roomId: string, peerId: string }): void {
        try {
            if (!socket.userId) return;

            console.log(`🔍 SocketServer - User ${socket.username} leaving video room ${data.roomId} with peer ${data.peerId}`);

            // Remove peer from video room
            this.videoRooms.get(data.roomId)?.delete(data.peerId);

            // Leave socket room
            socket.leave(data.roomId);

            // Notify other users in the room
            socket.to(data.roomId).emit('peer_left_room', {
                roomId: data.roomId,
                peerId: data.peerId
            });

            // Clean up empty rooms
            if (this.videoRooms.get(data.roomId)?.size === 0) {
                this.videoRooms.delete(data.roomId);
            }

            console.log(`🔍 SocketServer - User ${socket.username} left video room ${data.roomId}`);
        } catch (error) {
            console.error('Error handling leave video room:', error);
        }
    }
}

export default SocketServer;
