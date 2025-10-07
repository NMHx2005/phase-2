import dotenv from 'dotenv';
import { mongoDB } from '../db/mongodb';
import { DatabaseSeeder } from '../services/database.seeder';

// Load environment variables
dotenv.config();

async function migrateToMongoDB() {
    try {
        console.log('🚀 Starting migration to MongoDB Driver...');

        // Connect to MongoDB
        await mongoDB.connect();
        console.log('✅ Connected to MongoDB');

        // Clear existing data (optional - remove if you want to keep existing data)
        const collections = mongoDB.getCollections();
        console.log('🧹 Clearing existing data...');

        await Promise.all([
            collections.users.deleteMany({}),
            collections.groups.deleteMany({}),
            collections.channels.deleteMany({}),
            collections.messages.deleteMany({}),
            collections.videoCalls.deleteMany({}),
            collections.groupRequests.deleteMany({})
        ]);
        console.log('✅ Existing data cleared');

        // Seed new data
        const seeder = DatabaseSeeder.getInstance();
        await seeder.seedDatabase();

        console.log('🎉 Migration completed successfully!');
        console.log('📊 Database is now using MongoDB Driver instead of Mongoose');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        // Disconnect from MongoDB
        await mongoDB.disconnect();
        console.log('👋 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run migration
migrateToMongoDB();
