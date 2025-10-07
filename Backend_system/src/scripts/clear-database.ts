import { mongoDB } from '../db/mongodb';

async function clearDatabase() {
    try {
        console.log('🗑️ Connecting to MongoDB...');
        await mongoDB.connect();

        console.log('🧹 Clearing all collections...');
        const collections = mongoDB.getCollections();

        await collections.users.deleteMany({});
        await collections.groups.deleteMany({});
        await collections.channels.deleteMany({});
        await collections.messages.deleteMany({});

        console.log('✅ Database cleared successfully!');

    } catch (error) {
        console.error('❌ Error clearing database:', error);
    } finally {
        await mongoDB.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

clearDatabase();
