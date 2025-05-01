import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository, EntityManager, QueryRunner } from 'typeorm';
import { UserService } from '../user/user.service';
import { BadRequestException } from '@nestjs/common';
import { describe } from 'node:test';

describe('TaskService', () => {
  let service: TaskService;

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

  describe('Test of method get', () => {
    it('test badRequest', ()=> {
      expect(service.findOne(0)).rejects.toThrow(BadRequestException)
      expect(service.findOne(-1)).rejects.toThrow(BadRequestException)
      expect(service.findOne(NaN)).rejects.toThrow(BadRequestException)
    });
    
  });

  describe('Test of method findAllOfUser', () => {
    it('', ()=> {
      
    });
  });

});
