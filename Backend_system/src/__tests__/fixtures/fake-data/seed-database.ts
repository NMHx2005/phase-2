import { mongoDB } from '../../../db/mongodb';
// MongoDB connection is handled by mongoDB singleton
import { createFakeData } from './index';
// Models are now interfaces, not Mongoose models

export const seedDatabaseWithFakeData = async (): Promise<void> => {
    try {
        console.log('Connecting to database...');
        await mongoDB.connect();

        console.log('Clearing existing data...');
        const collections = mongoDB.getCollections();
        await Promise.all([
            collections.users.deleteMany({}),
            collections.groups.deleteMany({}),
            collections.channels.deleteMany({}),
            collections.messages.deleteMany({}),
            collections.videoCalls.deleteMany({})
        ]);

        console.log('Creating fake data...');
        const fakeData = await createFakeData();

        console.log('Seeding database...');

        // Insert users
        console.log('Inserting users...');
        await collections.users.insertMany(fakeData.users);

        // Insert groups
        console.log('Inserting groups...');
        await collections.groups.insertMany(fakeData.groups);

        // Insert channels
        console.log('Inserting channels...');
        await collections.channels.insertMany(fakeData.channels);

        // Insert messages
        console.log('Inserting messages...');
        await collections.messages.insertMany(fakeData.messages);

        // Insert video calls
        console.log('Inserting video calls...');
        await collections.videoCalls.insertMany(fakeData.videoCalls);

        console.log('Database seeded successfully!');
        console.log(`Total records inserted:`);
        console.log(`- Users: ${fakeData.users.length}`);
        console.log(`- Groups: ${fakeData.groups.length}`);
        console.log(`- Channels: ${fakeData.channels.length}`);
        console.log(`- Messages: ${fakeData.messages.length}`);
        console.log(`- Video Calls: ${fakeData.videoCalls.length}`);

    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    } finally {
        await mongoDB.disconnect();
        console.log('Database connection closed.');
    }
};

// Run if called directly
if (require.main === module) {
    seedDatabaseWithFakeData()
        .then(() => {
            console.log('Seeding completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}
