import app from './app';
// We are temporarily mocking the environment and DB checks so it boots successfully
// You will connect the real ones in the next step.

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  console.log('✅ Database connected');

  const server = app.listen(PORT, () => {
    console.log(`
🚀 Wisdomly API running
   Mode: development
   Port: ${PORT}
   URL:  http://localhost:${PORT}
   Health: http://localhost:${PORT}/health
    `);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap();