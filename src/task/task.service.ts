import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { User } from 'src/user/entities/user.entity';
import { CryptoService } from 'CryptoService';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly repository : Repository<Task>,
    @InjectRepository(User)
    private readonly userRepository : Repository<User>
  ){}

  async create(createTaskDto: CreateTaskDto, id: number) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
  
    try {
      if (!id) {
        throw new BadRequestException('User ID is required');
      }
  
      const user: User | null = await queryRunner.manager.findOne(User, { where: { id } });
  
      if (!user) {
        throw new NotFoundException(`User not found with ID ${id}`);
      }
  
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
      if (!id) {
        throw new BadRequestException('User ID is required');
      }

      const user: User | null = await this.userRepository.findOne({ where: {id}});
      
      if (user == null) {
        throw new NotFoundException('User not found with id ' + id);
      }

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
      if (!id) {
        throw new BadRequestException('ID is required');
      }

      const task: Task | null = await queryRunner.manager.findOne(Task, { where: { id } });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

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
      if (!id) {
        throw new BadRequestException('ID is required');
      }
  
      const task: Task | null = await queryRunner.manager.findOne(Task, { where: { id } });

      if (task == null) {
        throw new NotFoundException('Task not found');
      }

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
      if (!id) {
        throw new BadRequestException('ID is required');
      }
  
      const task = await queryRunner.manager.findOne(Task, { where: { id } });
  
      if (!task) {
        throw new NotFoundException('Task not found');
      }
  
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
