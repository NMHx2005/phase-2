module.exports = {
  // Test environment configuration
  testEnvironment: 'node',
  
  // Test database configuration
  testDatabase: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-system-test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // Test server configuration
  testServer: {
    port: process.env.TEST_API_PORT || 3001,
    host: 'localhost'
  },

  // Test socket configuration
  testSocket: {
    port: process.env.TEST_SOCKET_PORT || 3002,
    host: 'localhost'
  },

  // Test PeerJS configuration
  testPeerJS: {
    host: process.env.TEST_PEERJS_HOST || 'localhost',
    port: process.env.TEST_PEERJS_PORT || 9001,
    path: process.env.TEST_PEERJS_PATH || '/peerjs'
  },

  // Test data configuration
  testData: {
    users: {
      admin: {
        username: 'testadmin',
        email: 'admin@test.com',
        roles: ['admin']
      },
      user: {
        username: 'testuser',
        email: 'user@test.com',
        roles: ['user']
      }
    },
    groups: {
      default: {
        name: 'Test Group',
        description: 'Test group for video calls'
      }
    },
    channels: {
      general: {
        name: 'general',
        description: 'General discussion channel',
        isPrivate: false
      },
      private: {
        name: 'private',
        description: 'Private channel',
        isPrivate: true
      }
    }
  },

  // Test timeouts
  timeouts: {
    default: 10000,
    database: 30000,
    api: 15000,
    socket: 10000
  },

  // Test limits
  limits: {
    concurrentCalls: 10,
    maxCallDuration: 300000, // 5 minutes
    maxUsers: 100
  },

  // Test cleanup
  cleanup: {
    afterEach: true,
    afterAll: true,
    clearDatabase: true
  }
};
