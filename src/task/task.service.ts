import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from 'src/user/entities/user.entity';
import { CryptoService } from 'CryptoService';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repository : Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
    private readonly userService: UserService

  ){}

  async create(createTaskDto: CreateTaskDto, id: number) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
  
    try {
      const user: User = await this.userService.findOneAsync(id);
  
      const taskData = { ...createTaskDto, user };
      const task = queryRunner.manager.create(Task, taskData);
      
      await queryRunner.manager.save(task);
      await queryRunner.commitTransaction();
      
      return task;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  
  async findAllOfUser(id: number) {
    try {
      const user: User = await this.userService.findOneAsync(id);

      const tasks: Task[] = await this.repository.find({ where: { user: { id } } });

      return tasks
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      if (!id) {
        throw new BadRequestException('User ID is required');
      }

      const task: Task | null = await this.repository.findOne({where : { id } })
      
      if (task == null) {
        throw new NotFoundException('Task not found');
      }

      return task
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const task: Task = await this.findOne(id);

      await queryRunner.manager.update(Task, id, updateTaskDto);
      
      const updatedTask = await queryRunner.manager.findOne(Task, { where: { id } });
      await queryRunner.commitTransaction();
      
      return updatedTask;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
  
    try {
      const task: Task = await this.findOne(id);

      await queryRunner.manager.delete(Task, id);
      await queryRunner.commitTransaction();
      
      return 'task deleted';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async changeStatusTaskAsync(id: number): Promise<Task> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
  
    try {
      const task: Task = await this.findOne(id);
  
      task.done = !task.done;
  
      await queryRunner.manager.save(task);
      await queryRunner.commitTransaction();
      
      return task;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
