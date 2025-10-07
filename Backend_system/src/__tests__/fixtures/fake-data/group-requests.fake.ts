import { ObjectId } from 'mongodb';
import { IGroupRequest } from '../../models/group-request.model';

export const fakeGroupRequests: Partial<IGroupRequest>[] = [
    {
        userId: new ObjectId('68e02845ce489784ee3943c1'),
        username: 'john_doe',
        userEmail: 'john.doe@example.com',
        groupId: new ObjectId('68e02845ce489784ee3943d7'),
        groupName: 'Travel & Adventure',
        requestType: 'register_interest',
        status: 'pending',
        requestedAt: new Date('2024-01-15T10:30:00.000Z'),
        message: 'I love traveling and would like to join this group to share experiences!'
    },
    {
        userId: new ObjectId('68e02845ce489784ee3943c2'),
        username: 'jane_smith',
        userEmail: 'jane.smith@example.com',
        groupId: new ObjectId('68e02845ce489784ee3943d6'),
        groupName: 'Book Club',
        requestType: 'request_invite',
        status: 'approved',
        requestedAt: new Date('2024-01-14T14:20:00.000Z'),
        reviewedAt: new Date('2024-01-15T09:15:00.000Z'),
        reviewedBy: new ObjectId('68e02845ce489784ee3943ba'),
        reviewerName: 'admin',
        reason: 'Great profile and interests align with group goals'
    },
    {
        userId: new ObjectId('68e02845ce489784ee3943c3'),
        username: 'mike_wilson',
        userEmail: 'mike.wilson@example.com',
        groupId: new ObjectId('68e02845ce489784ee3943d5'),
        groupName: 'Fitness & Health',
        requestType: 'register_interest',
        status: 'rejected',
        requestedAt: new Date('2024-01-13T16:45:00.000Z'),
        reviewedAt: new Date('2024-01-14T11:30:00.000Z'),
        reviewedBy: new ObjectId('68e02845ce489784ee3943ba'),
        reviewerName: 'admin',
        reason: 'Group is currently at capacity'
    },
    {
        userId: new ObjectId('68e02845ce489784ee3943c4'),
        username: 'sarah_jones',
        userEmail: 'sarah.jones@example.com',
        groupId: new ObjectId('68e02845ce489784ee3943d4'),
        groupName: 'Photography Club',
        requestType: 'register_interest',
        status: 'pending',
        requestedAt: new Date('2024-01-12T12:15:00.000Z'),
        message: 'I am a professional photographer and would love to share tips and learn from others.'
    },
    {
        userId: new ObjectId('68e02845ce489784ee3943c5'),
        username: 'alex_brown',
        userEmail: 'alex.brown@example.com',
        groupId: new ObjectId('68e02845ce489784ee3943d3'),
        groupName: 'Music Lovers',
        requestType: 'request_invite',
        status: 'pending',
        requestedAt: new Date('2024-01-11T20:30:00.000Z'),
        message: 'Music is my passion! I play guitar and piano, would love to connect with fellow musicians.'
    },
    {
        userId: new ObjectId('68e02845ce489784ee3943c6'),
        username: 'emma_davis',
        userEmail: 'emma.davis@example.com',
        groupId: new ObjectId('68e02845ce489784ee3943d2'),
        groupName: 'Gaming Community',
        requestType: 'register_interest',
        status: 'approved',
        requestedAt: new Date('2024-01-10T18:00:00.000Z'),
        reviewedAt: new Date('2024-01-11T10:45:00.000Z'),
        reviewedBy: new ObjectId('68e02845ce489784ee3943ba'),
        reviewerName: 'admin'
    },
    {
        userId: new ObjectId('68e02845ce489784ee3943c7'),
        username: 'david_miller',
        userEmail: 'david.miller@example.com',
        groupId: new ObjectId('68e02845ce489784ee3943d1'),
        groupName: 'Tech Enthusiasts',
        requestType: 'register_interest',
        status: 'pending',
        requestedAt: new Date('2024-01-09T15:20:00.000Z'),
        message: 'Software developer with 5 years experience, interested in latest tech trends and discussions.'
    },
    {
        userId: new ObjectId('68e02845ce489784ee3943c8'),
        username: 'lisa_taylor',
        userEmail: 'lisa.taylor@example.com',
        groupId: new ObjectId('68e02845ce489784ee3943da'),
        groupName: 'VIP Members',
        requestType: 'request_invite',
        status: 'rejected',
        requestedAt: new Date('2024-01-08T11:30:00.000Z'),
        reviewedAt: new Date('2024-01-09T09:00:00.000Z'),
        reviewedBy: new ObjectId('68e02845ce489784ee3943ba'),
        reviewerName: 'admin',
        reason: 'VIP membership requires special approval process'
    },
    {
        userId: new ObjectId('68e02845ce489784ee3943c9'),
        username: 'tom_anderson',
        userEmail: 'tom.anderson@example.com',
        groupId: new ObjectId('68e02845ce489784ee3943d0'),
        groupName: 'General Discussion',
        requestType: 'register_interest',
        status: 'pending',
        requestedAt: new Date('2024-01-07T13:45:00.000Z'),
        message: 'New to the platform, looking forward to engaging discussions with the community.'
    },
    {
        userId: new ObjectId('68e02845ce489784ee3943ca'),
        username: 'rachel_green',
        userEmail: 'rachel.green@example.com',
        groupId: new ObjectId('68e02845ce489784ee3943dd'),
        groupName: 'Company Team',
        requestType: 'request_invite',
        status: 'approved',
        requestedAt: new Date('2024-01-06T16:15:00.000Z'),
        reviewedAt: new Date('2024-01-07T08:30:00.000Z'),
        reviewedBy: new ObjectId('68e02845ce489784ee3943ba'),
        reviewerName: 'admin',
        reason: 'Employee verification completed'
    }
];

export const getFakeGroupRequest = (index: number = 0): Partial<IGroupRequest> => {
    return fakeGroupRequests[index] || fakeGroupRequests[0];
};

export const getFakeGroupRequests = (count?: number): Partial<IGroupRequest>[] => {
    if (!count) return fakeGroupRequests;
    return fakeGroupRequests.slice(0, count);
};
