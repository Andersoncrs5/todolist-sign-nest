import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository, EntityManager, QueryRunner } from 'typeorm';
import { UserService } from '../user/user.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;

  const mockUser = { id: 1 };
  const mockTask = { id: 1, title: 'Test', done: false, user: mockUser } as Task;

  // Mock do QueryRunner
  const mockQueryRunner: Partial<QueryRunner> = {
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOne: jest.fn(),
    } as unknown as EntityManager,
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  // Mock do EntityManager com createQueryRunner
  const mockManager: Partial<EntityManager> = {
    connection: {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as any,
  };

  // Mock do repositório
  const mockRepository: Partial<Repository<Task>> = {
    findOne: jest.fn(),
    find: jest.fn(),
    manager: mockManager as EntityManager,
  };

  // Mock do UserService
  const mockUserService = {
    findOneAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Test of method findOne', () => {
    it('should throw BadRequestException if id is invalid', async () => {
      await expect(service.findOne(0)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(-1)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(NaN)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if task is not found', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });

    it('should return a task if found', async () => {
      (mockRepository.findOne as jest.Mock).mockResolvedValue(mockTask);
      const result = await service.findOne(1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('Test of method findAllOfUser', () => {
    it('should return all tasks of a user', async () => {
      (mockUserService.findOneAsync as jest.Mock).mockResolvedValue(mockUser);
      (mockRepository.find as jest.Mock).mockResolvedValue([mockTask]);

      const result = await service.findAllOfUser(1);
      expect(result).toEqual([mockTask]);
    });
  });

  describe('Test of method create', () => {
    it('should create and return a task', async () => {
      (mockUserService.findOneAsync as jest.Mock).mockResolvedValue(mockUser);
      (mockQueryRunner.manager?.create as jest.Mock).mockReturnValue(mockTask);
      (mockQueryRunner.manager?.save as jest.Mock).mockResolvedValue(mockTask);

      const result = await service.create({
        title: 'Test',
        description: 'test ',
        done: false
      }, 1);
      expect(result).toEqual(mockTask);
    });
  });

  describe('Test of method update', () => {
    it('should update and return a task', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTask);
      (mockQueryRunner.manager?.update as jest.Mock).mockResolvedValue(undefined);
      (mockQueryRunner.manager?.findOne as jest.Mock).mockResolvedValue({ ...mockTask, title: 'Updated' });

      const result = await service.update(1, { title: 'Updated' });
      expect(result?.title).toBe('Updated');
    });
  });

  describe('Test of method remove', () => {
    it('should delete and confirm deletion', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockTask);
      (mockQueryRunner.manager?.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await service.remove(1);
      expect(result).toBe('task deleted');
    });
  });

  describe('Test of method changeStatusTaskAsync', () => {
    it('should toggle the task status and return it', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue({ ...mockTask, done: false });
      (mockQueryRunner.manager?.save as jest.Mock).mockResolvedValue({ ...mockTask, done: true });

      const result = await service.changeStatusTaskAsync(1);
      expect(result.done).toBe(true);
    });
  });
});
