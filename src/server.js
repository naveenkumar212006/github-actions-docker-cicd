const http = require('node:http');
const { handleRequest } = require('./app');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = http.createServer(handleRequest);

server.listen(PORT, HOST, () => {
  console.log(`[SERVER] CI/CD Application running at http://${HOST}:${PORT}`);
  console.log(`[SERVER] Health check available at http://${HOST}:${PORT}/health`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling for Docker & Kubernetes
function shutdown(signal) {
  console.log(`[SERVER] Received ${signal}. Starting graceful shutdown...`);
  server.close((err) => {
    if (err) {
      console.error('[SERVER] Error during shutdown:', err);
      process.exit(1);
    }
    console.log('[SERVER] Closed all active connections. Process exited cleanly.');
    process.exit(0);
  });

  // Force close if connections don't drain within 5s
  setTimeout(() => {
    console.error('[SERVER] Forcing shutdown after timeout.');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
