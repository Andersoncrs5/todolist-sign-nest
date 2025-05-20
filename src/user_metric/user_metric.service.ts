import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UserMetric } from './entities/user_metric.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class UserMetricService {
  constructor(
    @InjectRepository(UserMetric)
    private readonly repository: Repository<UserMetric>,
  ) {}

  async create(user: User) {
    const data = { user }
    const create = await this.repository.create(data);
    await this.repository.save(create);
  }

  async findOne(user: User): Promise<UserMetric> {
    if ( user == null ) { throw new BadRequestException('Error the get metric'); }

    const metric: UserMetric | null = await this.repository.findOne({ where: { user } })

    if (metric == null) { throw new NotFoundException('metric not found') }

    return metric;
  }

  async update(user:User, metric: UserMetric) {
    const metricExisting = await this.findOne(user);
    metric.version = metricExisting.version;

    await this.repository.update(metricExisting.id, metric);
  }
}
