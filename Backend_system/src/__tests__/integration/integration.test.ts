import request from 'supertest';
import { app } from '../../app';
import { ObjectId } from 'mongodb';

describe.skip('Integration Tests - Complete User Flow', () => {
    let authToken: string;
    let userId: string;
    let groupId: string;
    let channelId: string;

    beforeAll(async () => {
        // Setup test data for integration tests
        userId = new ObjectId().toString();
        authToken = 'mock-jwt-token';
        groupId = new ObjectId().toString();
        channelId = new ObjectId().toString();
    });

    describe('Complete User Journey', () => {
        it.skip('should complete full user flow: register -> login -> create group -> create channel -> send message', async () => {
            // Step 1: Login
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'integration@test.com',
                    password: 'password123'
                });

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body.success).toBe(true);
            authToken = loginResponse.body.data.accessToken;
            userId = loginResponse.body.data.user._id;

            // Step 2: Create a group
            const groupData = {
                name: 'Integration Test Group',
                description: 'Group for integration testing',
                isPrivate: false
            };

            const groupResponse = await request(app)
                .post('/api/groups')
                .set('Authorization', `Bearer ${authToken}`)
                .send(groupData);

            expect(groupResponse.status).toBe(201);
            expect(groupResponse.body.success).toBe(true);
            groupId = groupResponse.body.data._id;

            // Step 3: Create a channel in the group
            const channelData = {
                name: 'general',
                description: 'General channel',
                groupId: groupId,
                isPrivate: false,
                type: 'text'
            };

            const channelResponse = await request(app)
                .post('/api/channels')
                .set('Authorization', `Bearer ${authToken}`)
                .send(channelData);

            expect(channelResponse.status).toBe(201);
            expect(channelResponse.body.success).toBe(true);
            channelId = channelResponse.body.data._id;

            // Step 4: Send a message
            const messageData = {
                text: 'Hello from integration test!',
                channelId: channelId,
                type: 'text'
            };

            const messageResponse = await request(app)
                .post('/api/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .send(messageData);

            expect(messageResponse.status).toBe(201);
            expect(messageResponse.body.success).toBe(true);

            // Step 5: Retrieve messages
            const getMessagesResponse = await request(app)
                .get('/api/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ channelId: channelId });

            expect(getMessagesResponse.status).toBe(200);
            expect(getMessagesResponse.body.success).toBe(true);
            expect(getMessagesResponse.body.data.messages.length).toBeGreaterThan(0);

            // Step 6: Get user profile
            const profileResponse = await request(app)
                .get('/api/client/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(profileResponse.status).toBe(200);
            expect(profileResponse.body.success).toBe(true);
            expect(profileResponse.body.data._id).toBe(userId);

            // Step 7: Get user groups
            const groupsResponse = await request(app)
                .get('/api/client/groups')
                .set('Authorization', `Bearer ${authToken}`);

            expect(groupsResponse.status).toBe(200);
            expect(groupsResponse.body.success).toBe(true);
            expect(groupsResponse.body.data.groups.length).toBeGreaterThan(0);

            // Step 8: Cleanup - Delete the group
            const deleteGroupResponse = await request(app)
                .delete(`/api/groups/${groupId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(deleteGroupResponse.status).toBe(200);
            expect(deleteGroupResponse.body.success).toBe(true);
        }, 30000);

        it('should handle group collaboration flow', async () => {
            // Create a group
            const groupData = {
                name: 'Collaboration Test Group',
                description: 'Group for collaboration testing',
                isPrivate: false
            };

            const groupResponse = await request(app)
                .post('/api/groups')
                .set('Authorization', `Bearer ${authToken}`)
                .send(groupData);

            expect(groupResponse.status).toBe(201);
            groupId = groupResponse.body.data._id;

            // Create multiple channels
            const channels = ['general', 'random', 'announcements'];
            const createdChannels = [];

            for (const channelName of channels) {
                const channelData = {
                    name: channelName,
                    description: `${channelName} channel`,
                    groupId: groupId,
                    isPrivate: false,
                    type: 'text'
                };

                const channelResponse = await request(app)
                    .post('/api/channels')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(channelData);

                expect(channelResponse.status).toBe(201);
                createdChannels.push(channelResponse.body.data._id);
            }

            // Send messages to different channels
            for (let i = 0; i < createdChannels.length; i++) {
                const messageData = {
                    text: `Message ${i + 1} in ${channels[i]} channel`,
                    channelId: createdChannels[i],
                    type: 'text'
                };

                const messageResponse = await request(app)
                    .post('/api/messages')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(messageData);

                expect(messageResponse.status).toBe(201);
            }

            // Verify all channels have messages
            for (const channelId of createdChannels) {
                const messagesResponse = await request(app)
                    .get('/api/messages')
                    .set('Authorization', `Bearer ${authToken}`)
                    .query({ channelId: channelId });

                expect(messagesResponse.status).toBe(200);
                expect(messagesResponse.body.data.messages.length).toBeGreaterThan(0);
            }

            // Cleanup
            await request(app)
                .delete(`/api/groups/${groupId}`)
                .set('Authorization', `Bearer ${authToken}`);
        }, 30000);

        it('should handle file upload and sharing flow', async () => {
            // Create a group and channel
            const groupData = {
                name: 'File Test Group',
                description: 'Group for file testing',
                isPrivate: false
            };

            const groupResponse = await request(app)
                .post('/api/groups')
                .set('Authorization', `Bearer ${authToken}`)
                .send(groupData);

            groupId = groupResponse.body.data._id;

            const channelData = {
                name: 'files',
                description: 'File sharing channel',
                groupId: groupId,
                isPrivate: false,
                type: 'text'
            };

            const channelResponse = await request(app)
                .post('/api/channels')
                .set('Authorization', `Bearer ${authToken}`)
                .send(channelData);

            channelId = channelResponse.body.data._id;

            // Upload a file (simulate with text file)
            const fileData = {
                text: 'test-file.txt',
                channelId: channelId,
                type: 'file',
                fileName: 'test-file.txt',
                fileUrl: 'uploads/files/test-file.txt'
            };

            const fileMessageResponse = await request(app)
                .post('/api/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .send(fileData);

            expect(fileMessageResponse.status).toBe(201);
            expect(fileMessageResponse.body.success).toBe(true);

            // Retrieve file messages
            const messagesResponse = await request(app)
                .get('/api/messages')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ channelId: channelId, type: 'file' });

            expect(messagesResponse.status).toBe(200);
            expect(messagesResponse.body.data.messages.length).toBeGreaterThan(0);

            // Cleanup
            await request(app)
                .delete(`/api/groups/${groupId}`)
                .set('Authorization', `Bearer ${authToken}`);
        }, 30000);
    });

    describe('Error Handling Integration', () => {
        it('should handle authentication errors gracefully', async () => {
            // Try to access protected route without token
            const response = await request(app)
                .get('/api/client/profile');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('should handle invalid data gracefully', async () => {
            // Try to create group with invalid data
            const invalidGroupData = {
                name: '', // Empty name
                description: 'Test description'
            };

            const response = await request(app)
                .post('/api/groups')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidGroupData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should handle non-existent resources gracefully', async () => {
            const nonExistentId = new ObjectId().toString();

            const response = await request(app)
                .get(`/api/groups/${nonExistentId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });
    });
});
