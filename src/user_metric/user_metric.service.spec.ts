import { Test, TestingModule } from '@nestjs/testing';
import { UserMetricService } from './user_metric.service';

describe('UserMetricService', () => {
  let service: UserMetricService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserMetricService],
    }).compile();

    service = module.get<UserMetricService>(UserMetricService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
