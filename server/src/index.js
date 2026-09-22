import app from './app.js';
import { connectDatabase } from './config/database.js';
import { config } from './config/index.js';

async function start() {
  console.log('Starting server...');
  await connectDatabase();
  console.log('Database connected');
  const server = app.listen(config.port, () => {
    console.log(`LostLens server running on http://localhost:${config.port}`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  server.on('close', () => {
    console.log('Server closed');
  });

  console.log('Server setup complete, keeping process alive...');

  // Keep the event loop alive
  setInterval(() => {
    // This interval keeps the Node.js process from exiting
  }, 1000);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  console.error('Error stack:', err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  console.error('Error stack:', err.stack);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  console.error('Error stack:', err.stack);
  process.exit(1);
});
