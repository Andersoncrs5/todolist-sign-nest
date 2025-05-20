import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { TaskModule } from './task/task.module';
import { User } from './user/entities/user.entity';
import { Task } from './task/entities/task.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { UserMetricModule } from './user_metric/user_metric.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: Number(process.env.TTL),
          limit: Number(process.env.TIME),
        },
      ],
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory()  {
        return {
          type:  'postgres',
          host: String(process.env.DB_HOST) || '',
          port:  Number(process.env.DB_PORT) || 5432,
          username: String(process.env.DB_USER) || '',
          password: String(process.env.DB_PASSWORD) || '',
          database: String(process.env.DB_NAME) || '',
          entities: [User, Task],
          synchronize: true,
          autoLoadEntities: true,
        };
      },
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return addTransactionalDataSource(new DataSource(options));
      },
    },
  ),
    UserModule,
    TaskModule,
    AuthModule,
    UserMetricModule,
    
  ],
  
})
export class AppModule {}