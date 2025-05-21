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
    const create = this.repository.create({ user });
    await this.repository.save(create);
  }

  async findOne(id: number): Promise<UserMetric> {
    if ( id == null ) { throw new BadRequestException('Error the get metric'); }

    const metric: UserMetric | null = await this.repository.findOne({ where: { user: { id } } })

    if (metric == null) { throw new NotFoundException('metric not found') }

    return metric;
  }

  async update(user:User, metric: UserMetric) {
    const metricExisting = await this.findOne(user.id);
    metric.version = metricExisting.version;

    await this.repository.update(metricExisting.id, metric);
  }
}
