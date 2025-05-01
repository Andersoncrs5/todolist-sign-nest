import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from '..//user/entities/user.entity';
import { CryptoService } from '../../CryptoService';
import { UserService } from '../user/user.service';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repository : Repository<Task>,
    private readonly userService: UserService

  ){}

  async create(createTaskDto: CreateTaskDto, id: number): Promise<Task> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
  
    const user: User = await this.userService.findOneAsync(id);
  
    const taskData = { ...createTaskDto, user };

    try {
      
      const task: Task = queryRunner.manager.create(Task, taskData);
      
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
  
  async findAllOfUser(id: number): Promise<Task[]> {
    const user: User = await this.userService.findOneAsync(id);

    return await this.repository.find({ where: { user: { id } } });
  }

  async findOne(id: number): Promise<Task> {
    
    if (!id || id <= 0 || isNaN(id) ) {
      throw new BadRequestException('User ID is required');
    }

    const task: Task | null = await this.repository.findOne({where : { id } })
    
    if (task == null) {
      throw new NotFoundException('Task not found');
    }

    return task
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    const task: Task = await this.findOne(id);

    try {
      
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
  
    const task: Task = await this.findOne(id);

    try {

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
  
    const task: Task = await this.findOne(id);

    try {
  
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
