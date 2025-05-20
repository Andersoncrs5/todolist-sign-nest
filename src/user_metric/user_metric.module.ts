import { Module } from '@nestjs/common';
import { UserMetricService } from './user_metric.service';
import { UserMetricController } from './user_metric.controller';
import { UserMetric } from './entities/user_metric.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserMetric]), UserModule],
  controllers: [UserMetricController],
  providers: [UserMetricService],
  exports: [UserMetricService],
})
export class UserMetricModule {}
