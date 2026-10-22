import dotenv from 'dotenv';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import Movie from './models/Movie.js';
import { seedDatabase } from './utils/seedRunner.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is currently empty
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Startup] Database is empty. Seeding initial CineScope catalog...');
      await seedDatabase({ quiet: false });
    }

    const server = app.listen(PORT, () => {
      console.log(`[CineScope Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[CineScope Backend] Healthcheck URL: http://localhost:${PORT}/api/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Server] Process terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error(`[Server Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
