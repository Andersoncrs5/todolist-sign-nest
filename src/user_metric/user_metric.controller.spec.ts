import { Test, TestingModule } from '@nestjs/testing';
import { UserMetricController } from './user_metric.controller';
import { UserMetricService } from './user_metric.service';

describe('UserMetricController', () => {
  let controller: UserMetricController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserMetricController],
      providers: [UserMetricService],
    }).compile();

    controller = module.get<UserMetricController>(UserMetricController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
