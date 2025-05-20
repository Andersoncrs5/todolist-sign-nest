import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType } from '@nestjs/common'; 
import { config as dotenvConfig } from 'dotenv';
import fastifyCors from '@fastify/cors';
import { AllExceptionsFilter } from './utils/all-exceptions';
import { initializeTransactionalContext } from 'typeorm-transactional';

dotenvConfig();

async function bootstrap() {
  initializeTransactionalContext()

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.register(fastifyCors, {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] 
  });  

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: Boolean(process.env.TRANSFORM), 
      whitelist: Boolean(process.env.WHITELIST), 
      forbidNonWhitelisted: Boolean(process.env.FORBIDNONWHITELISTED), 
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('To Do List API')
    .setDescription('API for managing tasks with user authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('tasks')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(Number(process.env.PORT) ?? 3000);
}

bootstrap();