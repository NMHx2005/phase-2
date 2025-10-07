import dotenv from 'dotenv';
import { createApp } from './app';
import { mongoDB } from './db/mongodb';
import { createServer } from 'http';
import { SocketServer } from './sockets';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoDB.connect();

    // Seed database with initial data
    const { DatabaseSeeder } = await import('./services/database.seeder');
    const seeder = DatabaseSeeder.getInstance();
    await seeder.seedDatabase();

    const app = createApp();
    const server = createServer(app);

    // Initialize Socket.io
    const socketServer = new SocketServer(server);

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔌 Socket.io server initialized`);
      console.log(`📹 PeerJS server should run separately on port 9000`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

startServer();
