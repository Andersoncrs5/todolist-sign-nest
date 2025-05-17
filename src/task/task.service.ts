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

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
    private readonly userService: UserService,
  ) {}

  @Transactional()
  async create(createTaskDto: CreateTaskDto, id: number): Promise<Task> {
    const user: User = await this.userService.findOneAsync(id);
    const taskData = { ...createTaskDto, user };
    const task: Task = this.repository.create(taskData);
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
    await this.findOne(id); 
    await this.repository.delete(id);
    return 'task deleted';
  }

  @Transactional()
  async changeStatusTaskAsync(id: number): Promise<Task> {
    const task: Task = await this.findOne(id);
    task.done = !task.done;
    return await this.repository.save(task);
  }
}
