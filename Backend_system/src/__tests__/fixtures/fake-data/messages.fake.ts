import { ObjectId } from 'mongodb';
import { FakeUser } from './users.fake';
import { FakeChannel } from './channels.fake';

export interface FakeMessage {
    _id: ObjectId;
    channelId: ObjectId;
    userId: ObjectId; // Changed from senderId
    username: string; // Added required field
    text?: string; // Changed from content
    fileUrl?: string;
    imageUrl?: string;
    type: 'text' | 'image' | 'file'; // Changed from messageType
    createdAt: Date;
    updatedAt: Date;
}

export const createFakeMessages = (users: FakeUser[], channels: FakeChannel[]): FakeMessage[] => {
    const messages: FakeMessage[] = [];
    const messageTemplates = [
        "Hello everyone! How's it going?",
        "Great discussion! I totally agree with that point.",
        "Does anyone know how to solve this problem?",
        "Thanks for sharing this information!",
        "I have a question about the project...",
        "This is really helpful, thank you!",
        "Can we schedule a meeting for next week?",
        "I'll work on that and get back to you soon.",
        "What do you think about this approach?",
        "Let me know if you need any help!",
        "That's an interesting perspective.",
        "I'm looking forward to the next update.",
        "Has anyone tried this before?",
        "This looks promising!",
        "I'll take a look at this later.",
        "Thanks for the feedback!",
        "Let's discuss this in more detail.",
        "I think we should consider this option.",
        "That makes perfect sense to me.",
        "I'm excited about this project!"
    ];

    channels.forEach((channel, channelIndex) => {
        const messageCount = Math.floor(Math.random() * 50) + 10;
        const channelUsers = users.slice(0, Math.min(5, users.length));

        for (let i = 0; i < messageCount; i++) {
            const sender = channelUsers[Math.floor(Math.random() * channelUsers.length)]!;
            const messageType = Math.random() < 0.9 ? 'text' :
                Math.random() < 0.95 ? 'image' : 'file';

            let content = messageTemplates[Math.floor(Math.random() * messageTemplates.length)]!;

            // Add some variety to messages
            if (Math.random() < 0.3) {
                content += " " + generateRandomEmoji();
            }

            if (Math.random() < 0.1) {
                content = `@${channelUsers[Math.floor(Math.random() * channelUsers.length)]!.username} ${content}`;
            }

            // Create message with proper text based on type
            let messageText: string | undefined;
            let fileUrl: string | undefined;
            let imageUrl: string | undefined;

            if (messageType === 'text') {
                messageText = content;
            } else if (messageType === 'image') {
                messageText = 'Sent an image';
                imageUrl = `https://example.com/images/${Math.random().toString(36).substr(2, 9)}.jpg`;
            } else if (messageType === 'file') {
                messageText = 'Sent a file';
                fileUrl = `https://example.com/files/${Math.random().toString(36).substr(2, 9)}.pdf`;
            }

            const message: FakeMessage = {
                _id: new ObjectId(),
                channelId: channel._id,
                userId: sender._id,
                username: sender.username,
                text: messageText,
                fileUrl: fileUrl,
                imageUrl: imageUrl,
                type: messageType,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                updatedAt: new Date()
            };

            messages.push(message);
        }
    });

    return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
};

const generateRandomEmoji = (): string => {
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
    return emojis[Math.floor(Math.random() * emojis.length)]!;
};

export const getRandomMessage = (messages: FakeMessage[]): FakeMessage => {
    return messages[Math.floor(Math.random() * messages.length)]!;
};

export const getMessagesByChannel = (messages: FakeMessage[], channelId: ObjectId): FakeMessage[] => {
    return messages.filter(message => message.channelId.equals(channelId));
};

export const getMessagesByUser = (messages: FakeMessage[], userId: ObjectId): FakeMessage[] => {
    return messages.filter(message => message.userId.equals(userId));
};
