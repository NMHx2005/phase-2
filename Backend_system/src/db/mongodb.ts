import { MongoClient, Db, Collection, Document } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseCollections {
    users: Collection<Document>;
    groups: Collection<Document>;
    channels: Collection<Document>;
    messages: Collection<Document>;
    videoCalls: Collection<Document>;
    groupRequests: Collection<Document>;
}

class MongoDBConnection {
    private static instance: MongoDBConnection;
    private client: MongoClient | null = null;
    private db: Db | null = null;
    private collections: DatabaseCollections | null = null;

    private constructor() { }

    public static getInstance(): MongoDBConnection {
        if (!MongoDBConnection.instance) {
            MongoDBConnection.instance = new MongoDBConnection();
        }
        return MongoDBConnection.instance;
    }

    public async connect(): Promise<void> {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-system';

            this.client = new MongoClient(mongoUri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4
            });

            await this.client.connect();
            console.log('✅ Connected to MongoDB');

            // Get database
            this.db = this.client.db('chat-system');

            // Initialize collections
            this.collections = {
                users: this.db.collection('users'),
                groups: this.db.collection('groups'),
                channels: this.db.collection('channels'),
                messages: this.db.collection('messages'),
                videoCalls: this.db.collection('videoCalls'),
                groupRequests: this.db.collection('groupRequests')
            };

            // Create indexes
            await this.createIndexes();

        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
            this.collections = null;
            console.log('✅ Disconnected from MongoDB');
        }
    }

    public getDatabase(): Db {
        if (!this.db) {
            throw new Error('Database not connected');
        }
        return this.db;
    }

    public getCollections(): DatabaseCollections {
        if (!this.collections) {
            throw new Error('Collections not initialized');
        }
        return this.collections;
    }

    public getCollection<T extends Document = Document>(name: keyof DatabaseCollections): Collection<T> {
        if (!this.collections) {
            throw new Error('Collections not initialized');
        }
        return this.collections[name] as unknown as Collection<T>;
    }

    private async createIndexes(): Promise<void> {
        if (!this.collections) return;

        try {
            // Users indexes
            await this.collections.users.createIndex({ email: 1 }, { unique: true });
            await this.collections.users.createIndex({ username: 1 }, { unique: true });
            await this.collections.users.createIndex({ isActive: 1 });

            // Groups indexes
            await this.collections.groups.createIndex({ name: 1 }, { unique: true });
            await this.collections.groups.createIndex({ isActive: 1 });
            await this.collections.groups.createIndex({ 'members.userId': 1 });

            // Channels indexes
            await this.collections.channels.createIndex({ name: 1 }, { unique: true }).catch(() => { });
            await this.collections.channels.createIndex({ groupId: 1 });
            await this.collections.channels.createIndex({ isActive: 1 });

            // Messages indexes
            await this.collections.messages.createIndex({ channelId: 1 });
            await this.collections.messages.createIndex({ userId: 1 });
            await this.collections.messages.createIndex({ createdAt: -1 });
            await this.collections.messages.createIndex({ channelId: 1, createdAt: -1 });

            // Video calls indexes
            await this.collections.videoCalls.createIndex({ callerId: 1 });
            await this.collections.videoCalls.createIndex({ receiverId: 1 });
            await this.collections.videoCalls.createIndex({ status: 1 });
            await this.collections.videoCalls.createIndex({ startTime: -1 });

            // Group requests indexes
            await this.collections.groupRequests.createIndex({ groupId: 1 });
            await this.collections.groupRequests.createIndex({ userId: 1 });
            await this.collections.groupRequests.createIndex({ status: 1 });
            await this.collections.groupRequests.createIndex({ requestedAt: -1 });

            console.log('✅ Database indexes created successfully');
        } catch (error) {
            console.error('❌ Error creating indexes:', error);
            throw error;
        }
    }

    public isConnected(): boolean {
        return this.client !== null && this.db !== null;
    }
}

export const mongoDB = MongoDBConnection.getInstance();
export default mongoDB;
