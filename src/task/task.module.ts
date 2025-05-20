import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './entities/task.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { UserMetricModule } from 'src/user_metric/user_metric.module';
import { UserMetric } from 'src/user_metric/entities/user_metric.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, UserMetric]), UserModule, UserMetricModule], 
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
