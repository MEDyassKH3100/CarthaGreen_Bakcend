import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Get port from config
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3000;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();