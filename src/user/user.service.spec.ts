import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, QueryRunner, EntityManager } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;
  
  const mockQueryRunner: Partial<QueryRunner> = {
    manager: {
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as EntityManager,
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  const mockManager: Partial<EntityManager> = {
    connection: {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as unknown as any,
  };

  const mockRepository: Partial<Repository<User>> = {
    findOne: jest.fn(),
    manager: mockManager as EntityManager,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test BadRequest', () => {
    expect(service.findOneAsync(-1)).rejects.toThrow(BadRequestException);
    expect(service.findOneAsync(0)).rejects.toThrow(BadRequestException);
    expect(service.findOneAsync(NaN)).rejects.toThrow(BadRequestException);
  });

  it('Test Not found', () => {
    expect(service.findOneAsync(999999)).rejects.toThrow(NotFoundException);
  });

  
});
