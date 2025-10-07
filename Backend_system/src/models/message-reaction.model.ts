import { ObjectId, Document } from 'mongodb';
import { mongoDB } from '../db/mongodb';

export interface IMessageReaction extends Document {
    _id?: ObjectId;
    messageId: ObjectId;
    userId: ObjectId;
    reaction: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessageReactionCreate {
    messageId: ObjectId;
    userId: ObjectId;
    reaction: string;
}

export interface IMessageReactionUpdate {
    reaction?: string;
    updatedAt?: Date;
}

export class MessageReaction {
    static collectionName = 'messageReactions';

    static async create(data: IMessageReactionCreate): Promise<IMessageReaction> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);

        const messageReaction: IMessageReaction = {
            _id: new ObjectId(),
            messageId: data.messageId,
            userId: data.userId,
            reaction: data.reaction,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await collection.insertOne(messageReaction);
        return messageReaction;
    }

    static async findById(id: ObjectId): Promise<IMessageReaction | null> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        return await collection.findOne({ _id: id }) as IMessageReaction | null;
    }

    static async findByMessageId(messageId: ObjectId): Promise<IMessageReaction[]> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        return await collection.find({ messageId }).toArray() as IMessageReaction[];
    }

    static async findByUserAndMessage(messageId: ObjectId, userId: ObjectId): Promise<IMessageReaction | null> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        return await collection.findOne({ messageId, userId }) as IMessageReaction | null;
    }

    static async updateById(id: ObjectId, data: IMessageReactionUpdate): Promise<IMessageReaction | null> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);

        const update = { ...data, updatedAt: new Date() };
        const result = await collection.findOneAndUpdate(
            { _id: id },
            { $set: update },
            { returnDocument: 'after' }
        );

        return result as IMessageReaction | null;
    }

    static async deleteById(id: ObjectId): Promise<boolean> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        const result = await collection.deleteOne({ _id: id });
        return result.deletedCount > 0;
    }

    static async deleteByUserAndMessage(messageId: ObjectId, userId: ObjectId): Promise<boolean> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);
        const result = await collection.deleteOne({ messageId, userId });
        return result.deletedCount > 0;
    }

    static async getReactionCounts(messageId: ObjectId): Promise<{ [reaction: string]: number }> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);

        const pipeline = [
            { $match: { messageId } },
            { $group: { _id: '$reaction', count: { $sum: 1 } } }
        ];

        const result = await collection.aggregate(pipeline).toArray();
        const counts: { [reaction: string]: number } = {};

        result.forEach((item: any) => {
            counts[item._id] = item.count;
        });

        return counts;
    }

    static async getUserReactions(messageId: ObjectId): Promise<{ [reaction: string]: ObjectId[] }> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);

        const reactions = await collection.find({ messageId }).toArray();
        const userReactions: { [reaction: string]: ObjectId[] } = {};

        reactions.forEach((reaction: any) => {
            if (!userReactions[reaction.reaction]) {
                userReactions[reaction.reaction] = [];
            }
            userReactions[reaction.reaction]?.push(reaction.userId);
        });

        return userReactions;
    }

    static async createIndexes(): Promise<void> {
        const db = mongoDB.getDatabase();
        const collection = db.collection(this.collectionName);

        // Compound index to ensure one reaction per user per message
        await collection.createIndex({ messageId: 1, userId: 1 }, { unique: true });

        // Index for efficient querying
        await collection.createIndex({ messageId: 1 });
        await collection.createIndex({ userId: 1 });
    }
}
