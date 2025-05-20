import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserMetricService } from './user_metric.service';

@Controller('user-metric')
export class UserMetricController {
  constructor(private readonly userMetricService: UserMetricService) {}
}
