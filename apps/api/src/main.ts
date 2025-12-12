import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as net from 'net';

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

async function findAvailablePort(startPort: number, maxAttempts = 10): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const port = startPort + i;
    if (await isPortAvailable(port)) {
      return port;
    }
    console.log(`⚠️  Port ${port} is in use, trying ${port + 1}...`);
  }
  throw new Error(`No available port found after ${maxAttempts} attempts`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const basePort = Number(process.env.PORT) || 4000;
  const port = await findAvailablePort(basePort);

  // CORS設定: 本番環境と開発環境で適切に動作
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((url) => url.trim())
    : ['http://localhost:3000'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(port);
  console.log(`🚀 NestJS ready: http://localhost:${port}`);
}
void bootstrap();
