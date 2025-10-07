# 🏗️ Backend Architecture Documentation

## Overview
The backend is built with Node.js, Express.js, and MongoDB (direct driver) to provide a robust API and real-time communication for the chat system.

## Project Structure

```
Backend_system/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server startup
│   ├── config/
│   │   └── peerjs.config.ts   # PeerJS server configuration
│   ├── controllers/           # API route handlers
│   │   ├── auth.controller.mongodb.ts
│   │   ├── admin.controller.mongodb.ts
│   │   ├── client.controller.mongodb.ts
│   │   ├── groups.controller.mongodb.ts
│   │   ├── channels.controller.mongodb.ts
│   │   ├── messages.controller.mongodb.ts
│   │   └── users.controller.mongodb.ts
│   ├── services/              # Business logic layer
│   │   ├── user.service.ts
│   │   ├── group.service.ts
│   │   ├── channel.service.ts
│   │   ├── message.service.ts
│   │   ├── admin.service.ts
│   │   ├── video-call.service.ts
│   │   └── database.seeder.ts
│   ├── routes/                # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── admin.routes.ts
│   │   ├── client.routes.ts
│   │   ├── groups.routes.ts
│   │   ├── channels.routes.ts
│   │   ├── messages.routes.ts
│   │   ├── users.routes.ts
│   │   ├── upload.routes.ts
│   │   └── video-call.routes.ts
│   ├── models/                # Data model interfaces
│   │   ├── user.model.ts
│   │   ├── group.model.ts
│   │   ├── channel.model.ts
│   │   ├── message.model.ts
│   │   └── video-call.model.ts
│   ├── middleware/            # Custom middleware
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   ├── client.middleware.ts
│   │   └── upload.middleware.ts
│   ├── db/
│   │   └── mongodb.ts         # MongoDB connection
│   ├── sockets/
│   │   ├── socket.server.ts    # Socket.io server logic
│   │   └── socket.types.ts     # Socket event types
│   ├── scripts/
│   │   ├── seed-sample-data.ts # Database seeding
│   │   └── clear-database.ts   # Database cleanup
│   └── __tests__/             # Test files
│       ├── routes/            # Route tests
│       ├── services/          # Service tests
│       ├── utils/             # Test utilities
│       └── fixtures/          # Test data
├── uploads/                   # File storage
│   ├── avatars/
│   ├── images/
│   └── files/
├── dist/                      # Compiled JavaScript
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Architecture Patterns

### MVC Pattern
- **Models:** Data structure definitions and validation
- **Views:** JSON API responses
- **Controllers:** Request handling and response formatting

### Service Layer Pattern
- **Services:** Business logic and database operations
- **Controllers:** HTTP request/response handling
- **Separation of Concerns:** Clear boundaries between layers

### Repository Pattern (Implicit)
- **Services:** Act as repositories for data access
- **Database Abstraction:** MongoDB operations encapsulated in services

## Data Flow

```
HTTP Request → Route → Middleware → Controller → Service → Database
                     ↓
HTTP Response ← JSON ← Controller ← Service ← Database
```

## Key Components

### Controllers
Handle HTTP requests and responses:
- Input validation
- Authentication checks
- Service method calls
- Response formatting
- Error handling

### Services
Contain business logic:
- Database operations
- Data validation
- Business rules
- Error handling
- Data transformation

### Middleware
Handle cross-cutting concerns:
- Authentication
- Authorization
- File uploads
- Error handling
- Request logging

### Socket.io Integration
Real-time communication:
- Message broadcasting
- User presence
- Typing indicators
- Video call signaling
- Channel management

## Database Design

### Collections
1. **users** - User accounts and profiles
2. **groups** - Chat groups and memberships
3. **channels** - Group channels and settings
4. **messages** - Chat messages and metadata
5. **video_calls** - Video call history and status

### Indexes
- **users:** email (unique), username (unique)
- **groups:** name (unique), createdBy
- **channels:** name (unique), groupId
- **messages:** channelId, createdAt
- **video_calls:** callerId, receiverId, status

## Security Implementation

### Authentication
- JWT tokens for stateless authentication
- Password hashing with bcrypt
- Token expiration and refresh

### Authorization
- Role-based access control (RBAC)
- Route-level permission checks
- Resource-level access validation

### File Upload Security
- File type validation
- Size limits
- Secure file storage
- Path sanitization

## Performance Optimizations

### Database
- Proper indexing strategy
- Connection pooling
- Query optimization
- Lazy initialization

### Caching
- User session caching
- File metadata caching
- Connection state caching

### Real-time Communication
- Socket.io rooms for channel isolation
- Event throttling for typing indicators
- Connection state management

## Error Handling

### Global Error Handler
- Centralized error processing
- Consistent error response format
- Logging and monitoring

### Validation Errors
- Input validation with detailed messages
- Type checking and sanitization
- Business rule validation

### Database Errors
- Connection error handling
- Query error recovery
- Transaction rollback

## Testing Strategy

### Unit Tests
- Service layer testing
- Controller testing
- Utility function testing

### Integration Tests
- API endpoint testing
- Database integration testing
- Socket.io event testing

### Test Utilities
- Mock data generators
- Test database setup
- Authentication helpers

## Deployment Considerations

### Environment Configuration
- Environment-specific settings
- Secret management
- Database connection strings

### Production Optimizations
- Process management with PM2
- Load balancing
- Database replication
- File storage optimization

### Monitoring
- Application logging
- Performance metrics
- Error tracking
- Health checks
