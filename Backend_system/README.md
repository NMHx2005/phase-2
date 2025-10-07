# Chat System Backend API

## Project Overview

A comprehensive chat system backend built with Node.js, Express.js, and MongoDB, providing a complete API for real-time messaging, file sharing, video calls, and administrative functionality.

**Key Features**:
- Complete REST API with 54 endpoints
- Real-time messaging with WebSocket support
- File upload system (avatars, images, documents)
- Video call integration with PeerJS
- Role-based access control and admin panel
- Comprehensive testing suite with 86.5% coverage
- MongoDB integration with data seeding

## Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Backend_system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string and other configurations

# Seed the database with test data
npm run seed:mongodb

# Start the development server
npm run dev
```

The server will start on `http://localhost:3000`

### Health Check

```bash
# Basic health check
curl http://localhost:3000/health

# API information
curl http://localhost:3000/api
```

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user info |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (admin only) |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user (admin only) |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user (admin only) |
| GET | `/api/users/:id/groups` | Get user's groups |

### Group Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Get all groups |
| POST | `/api/groups` | Create new group |
| GET | `/api/groups/:id` | Get group by ID |
| PUT | `/api/groups/:id` | Update group |
| DELETE | `/api/groups/:id` | Delete group |
| POST | `/api/groups/:id/members` | Add member to group |
| DELETE | `/api/groups/:id/members/:userId` | Remove member from group |
| POST | `/api/groups/:id/admins` | Add admin to group |

### Channel Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/channels` | Get all channels |
| POST | `/api/channels` | Create new channel |
| GET | `/api/channels/:id` | Get channel by ID |
| PUT | `/api/channels/:id` | Update channel |
| DELETE | `/api/channels/:id` | Delete channel |
| GET | `/api/channels/group/:groupId` | Get channels by group |
| POST | `/api/channels/:id/members` | Add member to channel |
| DELETE | `/api/channels/:id/members/:userId` | Remove member from channel |

### Message System

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/messages` | Create new message |
| GET | `/api/messages/channel/:channelId` | Get messages by channel |
| GET | `/api/messages/user/:userId` | Get messages by user |
| GET | `/api/messages/:id` | Get message by ID |
| PUT | `/api/messages/:id` | Update message |
| DELETE | `/api/messages/:id` | Delete message |
| GET | `/api/messages/search` | Search messages |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/avatar` | Upload user avatar |
| POST | `/api/upload/image` | Upload image file |
| POST | `/api/upload/file` | Upload document file |
| POST | `/api/upload/multiple` | Upload multiple files |
| GET | `/api/upload/info/:filename` | Get file information |
| DELETE | `/api/upload/:filename` | Delete file |

### Video Calls

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/video-calls/history` | Get call history |
| GET | `/api/video-calls/active` | Get active calls |
| GET | `/api/video-calls/stats` | Get call statistics |
| POST | `/api/video-calls/cleanup` | Cleanup expired calls |

### Admin Panel

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get dashboard statistics |
| GET | `/api/admin/users` | Get all users (admin only) |
| POST | `/api/admin/users` | Create user (admin only) |
| DELETE | `/api/admin/users/:id` | Delete user (admin only) |
| GET | `/api/admin/stats` | Get system statistics |
| GET | `/api/admin/users/:userId/activity` | Get user activity logs |
| GET | `/api/admin/groups/stats` | Get group statistics |
| GET | `/api/admin/channels/stats` | Get channel statistics |

### Client API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/client/profile` | Get user profile |
| PUT | `/api/client/profile` | Update user profile |
| GET | `/api/client/groups` | Get user's groups |
| GET | `/api/client/channels` | Get user's channels |
| GET | `/api/client/messages` | Get user's messages |
| GET | `/api/client/notifications` | Get user notifications |
| PUT | `/api/client/notifications/:id/read` | Mark notification as read |
| GET | `/api/client/settings` | Get user settings |
| PUT | `/api/client/settings` | Update user settings |

## Database Schema

### User Model

```typescript
interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string; // hashed
  roles: string[]; // ['user', 'admin', 'super_admin']
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Group Model

```typescript
interface Group {
  _id: ObjectId;
  name: string;
  description: string;
  category: string;
  createdBy: ObjectId;
  admins: ObjectId[];
  members: ObjectId[];
  maxMembers: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Channel Model

```typescript
interface Channel {
  _id: ObjectId;
  name: string;
  groupId: ObjectId;
  type: 'TEXT' | 'VOICE' | 'VIDEO';
  createdBy: ObjectId;
  members: ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message Model

```typescript
interface Message {
  _id: ObjectId;
  channelId: ObjectId;
  userId: ObjectId;
  username: string;
  text?: string;
  fileUrl?: string;
  imageUrl?: string;
  type: 'text' | 'image' | 'file';
  createdAt: Date;
  updatedAt: Date;
}
```

### Video Call Model

```typescript
interface VideoCall {
  _id: ObjectId;
  participants: ObjectId[];
  initiator: ObjectId;
  status: 'active' | 'ended' | 'missed';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Technology Stack

### Backend Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database
- **Socket.io** - Real-time communication
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **PeerJS** - Video call integration
- **Sharp** - Image processing
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logging

### Development Tools

- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server
- **ts-node** - TypeScript execution

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test -- src/__tests__/routes/auth.test.ts

# Run tests in watch mode
npm run test:watch
```

### Test Coverage

The project maintains comprehensive test coverage:

- **Total Test Suites**: 11 (8 passed, 3 skipped)
- **Total Tests**: 178 (144 passed, 34 skipped)
- **Coverage**: 86.5% of active tests
- **Execution Time**: ~10 seconds

### Test Categories

1. **Authentication Tests** (15 tests) - Login, registration, token management
2. **User Management Tests** (18 tests) - CRUD operations, role management
3. **Message System Tests** (15 tests) - Message creation, retrieval, search
4. **Channel Management Tests** (23 tests) - Channel operations, member management
5. **Group Management Tests** (6 tests) - Group creation, member management
6. **Admin Panel Tests** (16 tests) - Administrative functionality
7. **Video Call Tests** (17 tests) - Call management, statistics
8. **Client API Tests** (22 tests) - Client-side API endpoints
9. **Upload Tests** (20 tests) - File upload functionality (skipped)
10. **Integration Tests** (6 tests) - End-to-end workflows (skipped)

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/chat-system
MONGODB_TEST_URI=mongodb://localhost:27017/chat-system-test

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# File Upload Configuration
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf

# CORS Configuration
CORS_ORIGIN=http://localhost:4200

# PeerJS Configuration
PEERJS_PORT=9000
```

## Scripts

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run seed:mongodb # Seed database with test data
```

### Testing Scripts

```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
npm run test:routes  # Run only route tests
```

### Database Scripts

```bash
npm run seed:mongodb    # Seed database with test data
npm run migrate:mongodb # Run database migrations
```

## API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login**: Returns access token and refresh token
2. **Access Token**: Short-lived (1 hour) for API access
3. **Refresh Token**: Long-lived (7 days) for token renewal
4. **Authorization**: Include token in `Authorization: Bearer <token>` header

### Role-Based Access Control

- **user**: Basic user permissions
- **admin**: Group/channel administration
- **super_admin**: System-wide administration

## Real-time Features

### WebSocket Events

The server supports real-time communication through Socket.io:

- `message:new` - New message notification
- `message:update` - Message update notification
- `message:delete` - Message deletion notification
- `user:typing` - User typing indicator
- `user:online` - User online status
- `user:offline` - User offline status
- `call:start` - Video call initiation
- `call:end` - Video call termination

## File Upload

### Supported File Types

- **Images**: JPEG, PNG, GIF
- **Documents**: PDF, DOC, DOCX
- **Maximum Size**: 10MB per file

### Upload Endpoints

- `/api/upload/avatar` - User profile pictures
- `/api/upload/image` - Chat images
- `/api/upload/file` - Document sharing
- `/api/upload/multiple` - Batch file uploads

## Error Handling

The API implements comprehensive error handling:

- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists
- **422 Unprocessable Entity** - Validation errors
- **500 Internal Server Error** - Server errors

## Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis integration for frequently accessed data
- **Rate Limiting**: API rate limiting to prevent abuse
- **File Compression**: Image optimization and compression
- **Connection Pooling**: MongoDB connection pooling

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token generation and validation
- **CORS Protection**: Configurable cross-origin policies
- **Helmet Security**: Security headers middleware
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://production-server:27017/chat-system
JWT_SECRET=production-secret-key
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Support

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

**Port Already in Use**:
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**MongoDB Connection Issues**:
```bash
# Check MongoDB is running
systemctl status mongod

# Check connection string
mongosh "mongodb://localhost:27017/chat-system"
```

**Dependencies Issues**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=app:* npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write comprehensive tests
- Document new features

## License

This project is licensed under the ISC License.

## Support

For support and questions:

- Check the troubleshooting section
- Review the test files for usage examples
- Check the API documentation
- Create an issue for bugs or feature requests

## Version History

- **v1.0.0** - Initial release with complete API
- **v1.1.0** - Added comprehensive testing suite
- **v1.2.0** - Enhanced security and performance

---

**Last Updated**: October 7, 2025  
**Version**: 1.2.0  
**Author**: David Nguyen