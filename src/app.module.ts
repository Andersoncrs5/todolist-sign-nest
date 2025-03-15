import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { User } from './user/entities/user.entity';
import { Task } from './task/entities/task.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '12345678',
      database: process.env.DB_NAME || 'todolist_sign_nest',
      entities: [User, Task],
      synchronize: true,
      autoLoadEntities: true,
    }),
    UserModule,
    TaskModule,
    AuthModule,
  ],
})
export class AppModule {}
