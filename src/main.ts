import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common'; // ⬅️ Import necessário
import { config as dotenvConfig } from 'dotenv';
import fastifyCors from '@fastify/cors';

dotenvConfig();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.register(fastifyCors, {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] 
  });  

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, 
      whitelist: true, 
      forbidNonWhitelisted: true, 
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ToDo List API')
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