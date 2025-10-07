import { ObjectId, Document } from 'mongodb';

export interface IMessage extends Document {
  _id?: ObjectId;
  channelId: ObjectId;
  userId: ObjectId;
  username: string;
  text?: string;
  fileUrl?: string;
  imageUrl?: string;
  type: 'text' | 'image' | 'file';
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  replyTo?: ObjectId;
  originalMessageId?: ObjectId; // For reply messages
  isReply?: boolean; // Flag to indicate if this is a reply
  reactions?: Array<{
    userId: ObjectId;
    username: string;
    emoji: string;
    createdAt: Date;
  }>;
  mentions?: ObjectId[];
  tags?: string[];
}

export interface IMessageCreate {
  channelId: ObjectId;
  userId: ObjectId;
  username: string;
  text?: string;
  fileUrl?: string;
  imageUrl?: string;
  type: 'text' | 'image' | 'file';
  replyTo?: ObjectId;
  mentions?: ObjectId[];
  tags?: string[];
}

export interface IMessageUpdate {
  text?: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  editedAt?: Date;
  deletedAt?: Date;
  reactions?: Array<{
    userId: ObjectId;
    username: string;
    emoji: string;
    createdAt: Date;
  }>;
  mentions?: ObjectId[];
  tags?: string[];
}

export interface IMessageResponse {
  _id: string;
  channelId: string;
  userId: string;
  username: string;
  text?: string;
  fileUrl?: string;
  imageUrl?: string;
  type: 'text' | 'image' | 'file';
  isEdited: boolean;
  isDeleted: boolean;
  editedAt?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  replyTo?: string;
  reactions?: Array<{
    userId: string;
    username: string;
    emoji: string;
    createdAt: string;
  }>;
  mentions?: string[];
  tags?: string[];
}

class MessageModel {
  static toResponse(message: IMessage): IMessageResponse {
    return {
      _id: message._id?.toString() || '',
      channelId: message.channelId?.toString() || '',
      userId: message.userId?.toString() || '',
      username: message.username,
      text: message.text,
      fileUrl: message.fileUrl,
      imageUrl: message.imageUrl,
      type: message.type,
      isEdited: message.isEdited,
      isDeleted: message.isDeleted,
      editedAt: message.editedAt?.toISOString(),
      deletedAt: message.deletedAt?.toISOString(),
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      replyTo: message.replyTo?.toString(),
      reactions: message.reactions?.map(reaction => ({
        userId: reaction.userId.toString(),
        username: reaction.username,
        emoji: reaction.emoji,
        createdAt: reaction.createdAt.toISOString()
      })),
      mentions: message.mentions?.map(id => id.toString()),
      tags: message.tags
    };
  }

  static toCreate(data: IMessageCreate): Omit<IMessage, '_id' | 'createdAt' | 'updatedAt' | 'isEdited' | 'isDeleted' | 'reactions'> {
    return {
      channelId: data.channelId,
      userId: data.userId,
      username: data.username,
      text: data.text,
      fileUrl: data.fileUrl,
      imageUrl: data.imageUrl,
      type: data.type,
      isEdited: false,
      isDeleted: false,
      replyTo: data.replyTo,
      mentions: data.mentions,
      tags: data.tags
    };
  }

  static toUpdate(data: IMessageUpdate): Partial<IMessage> {
    const update: Partial<IMessage> = {};

    if (data.text !== undefined) update.text = data.text;
    if (data.isEdited !== undefined) update.isEdited = data.isEdited;
    if (data.isDeleted !== undefined) update.isDeleted = data.isDeleted;
    if (data.editedAt !== undefined) update.editedAt = data.editedAt;
    if (data.deletedAt !== undefined) update.deletedAt = data.deletedAt;
    if (data.reactions !== undefined) update.reactions = data.reactions;
    if (data.mentions !== undefined) update.mentions = data.mentions;
    if (data.tags !== undefined) update.tags = data.tags;

    update.updatedAt = new Date();

    return update;
  }
}

export { MessageModel };