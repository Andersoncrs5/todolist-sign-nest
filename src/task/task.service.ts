import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Transactional } from 'typeorm-transactional';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { UserMetricService } from 'src/user_metric/user_metric.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserMetric } from 'src/user_metric/entities/user_metric.entity';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { Subject } from 'rxjs';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
    @InjectRepository(UserMetric)
    private readonly metricRepository: Repository<UserMetric>,
    private readonly userService: UserService,
    private readonly metricService: UserMetricService
  ) {}

  private readonly transporter = nodemailer.createTransport({
        service: String(process.env.SERVICE),
        auth: {
          user: String(process.env.EMAIL),
          pass: String(process.env.PASSWORD),
        }
      });

  @Transactional()
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async metricCalc() {
    const users: UserMetric[] = await this.metricRepository.find({
      where: { wishReceiveMetricByEmail: true },
      relations: ['user'],
    });

    const filePath = path.join(process.cwd(), 'src', 'templates', 'metric-user.html');
    const template = fs.readFileSync(filePath, 'utf8');

    for (const u of users) {
      let html = template;
      html = html.replace(/{{totalTasksCreatedToday}}/g, String(u.totalTasksCreatedToday));
      html = html.replace(/{{tasksCompletedToday}}/g, String(u.tasksCompletedToday));

      await this.transporter.sendMail({
        from: `"My Task" <${process.env.EMAIL}>`,
        to: u.user.email,
        subject: 'Your metrics of today!!!',
        html,
      });

      u.totalTasksCreatedToday = 0
      u.tasksCompletedToday = 0

      await this.metricService.update(u.user, u);
    }
  }

  @Transactional()
  async create(createTaskDto: CreateTaskDto, id: number): Promise<Task> {
    const user: User = await this.userService.findOneAsync(id);
    const taskData = { ...createTaskDto, user };
    const task: Task = this.repository.create(taskData);

    const metric = await this.metricService.findOne(user)
    metric.totalTasksCreated += 1;
    metric.totalTasksCreatedToday += 1;
    metric.lastTaskCreatedAt = new Date;
    await this.metricService.update(user, metric);

    return await this.repository.save(task);
  }

  async findAllOfUser(userId: number, options: IPaginationOptions) {
    const queryBuilder = this.repository.createQueryBuilder('task');

    queryBuilder
    .where('task.userId = :userId', { userId }) 
    .orderBy('task.id', 'DESC');

    return paginate<Task>(queryBuilder, options);
  }

  async findOne(id: number): Promise<Task> {
    if (!id || id <= 0 || isNaN(id)) {
      throw new BadRequestException('User ID is required');
    }

    const task: Task | null = await this.repository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  @Transactional()
  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task: Task = await this.findOne(id); 

    const updateTask = this.repository.create({
      ...task,
      ...updateTaskDto,
      id: task.id,
      version: task.version
    })
    
    return await this.repository.save(updateTask);
  }

  @Transactional()
  async remove(id: number) {
    const task = await this.findOne(id); 
    await this.repository.delete(id);

    const metric = await this.metricService.findOne(task.user)
    metric.totalTasksDeleted += 1;
    await this.metricService.update(task.user, metric);
    
    return 'task deleted';
  }

  @Transactional()
  async changeStatusTaskAsync(id: number): Promise<Task> {
    const task: Task = await this.findOne(id);
    task.done = true;

    const metric = await this.metricService.findOne(task.user)
    metric.totalTasksCompleted += 1;
    metric.tasksCompletedToday += 1;
    
    await this.metricService.update(task.user, metric);

    return await this.repository.save(task);
  }
}
