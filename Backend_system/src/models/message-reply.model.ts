import { ObjectId, Document } from 'mongodb';
import { mongoDB } from '../db/mongodb';

export interface IMessageReply extends Document {
    _id?: ObjectId;
    originalMessageId: ObjectId;
    replyMessageId: ObjectId;
    channelId: ObjectId;
    userId: ObjectId;
    username: string;
    text: string;
    type: 'text' | 'image' | 'file';
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    isEdited: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessageReplyCreate {
    originalMessageId: ObjectId;
    replyMessageId: ObjectId;
    channelId: ObjectId;
    userId: ObjectId;
    username: string;
    text: string;
    type: 'text' | 'image' | 'file';
    imageUrl?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
}

export interface IMessageReplyUpdate {
    text?: string;
    isEdited?: boolean;
    isDeleted?: boolean;
    updatedAt?: Date;
}

export class MessageReply {
    static collectionName = 'messageReplies';

    static async create(data: IMessageReplyCreate): Promise<IMessageReply> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);

        const messageReply: IMessageReply = {
            _id: new ObjectId(),
            originalMessageId: data.originalMessageId,
            replyMessageId: data.replyMessageId,
            channelId: data.channelId,
            userId: data.userId,
            username: data.username,
            text: data.text,
            type: data.type,
            imageUrl: data.imageUrl,
            fileUrl: data.fileUrl,
            fileName: data.fileName,
            fileSize: data.fileSize,
            isEdited: false,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await collection.insertOne(messageReply);
        return messageReply;
    }

    static async findById(id: ObjectId): Promise<IMessageReply | null> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        return await collection.findOne({ _id: id }) as IMessageReply | null;
    }

    static async findByOriginalMessageId(originalMessageId: ObjectId, page: number = 1, limit: number = 20): Promise<IMessageReply[]> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        const skip = (page - 1) * limit;

        return await collection
            .find({ originalMessageId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .toArray() as IMessageReply[];
    }

    static async countByOriginalMessageId(originalMessageId: ObjectId): Promise<number> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        return await collection.countDocuments({ originalMessageId });
    }

    static async findByReplyMessageId(replyMessageId: ObjectId): Promise<IMessageReply | null> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        return await collection.findOne({ replyMessageId }) as IMessageReply | null;
    }

    static async findByChannelId(channelId: ObjectId): Promise<IMessageReply[]> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        return await collection.find({ channelId }).toArray() as IMessageReply[];
    }

    static async findByUserId(userId: ObjectId): Promise<IMessageReply[]> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        return await collection.find({ userId }).toArray() as IMessageReply[];
    }

    static async updateById(id: ObjectId, data: IMessageReplyUpdate): Promise<IMessageReply | null> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);

        const update = { ...data, updatedAt: new Date() };
        const result = await collection.findOneAndUpdate(
            { _id: id },
            { $set: update },
            { returnDocument: 'after' }
        );

        return result as IMessageReply | null;
    }

    static async deleteById(id: ObjectId): Promise<boolean> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        const result = await collection.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }

    static async softDeleteById(id: ObjectId): Promise<boolean> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        const result = await collection.updateOne(
            { _id: id },
            { $set: { isDeleted: true, updatedAt: new Date() } }
        );
        return result.modifiedCount > 0;
    }

    static async getMultipleMessageReplies(messageIds: ObjectId[]): Promise<{ [messageId: string]: IMessageReply[] }> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);

        const replies = await collection
            .find({ originalMessageId: { $in: messageIds } })
            .sort({ createdAt: -1 })
            .toArray() as IMessageReply[];

        const messageReplies: { [messageId: string]: IMessageReply[] } = {};

        messageIds.forEach(messageId => {
            messageReplies[messageId.toString()] = [];
        });

        replies.forEach((reply: any) => {
            const originalMessageId = reply.originalMessageId.toString();
            if (!messageReplies[originalMessageId]) {
                messageReplies[originalMessageId] = [];
            }
            messageReplies[originalMessageId].push(reply);
        });

        return messageReplies;
    }

    static async createIndexes(): Promise<void> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);

        // Indexes for efficient querying
        await collection.createIndex({ originalMessageId: 1 });
        await collection.createIndex({ replyMessageId: 1 });
        await collection.createIndex({ channelId: 1 });
        await collection.createIndex({ userId: 1 });
        await collection.createIndex({ createdAt: -1 });
    }
}
