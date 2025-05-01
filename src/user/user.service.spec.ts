import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository, QueryRunner, EntityManager } from 'typeorm';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CryptoService } from 'CryptoService';

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

  describe('Test in method findOne', () => {
    it('test BadRequest', () => {
      expect(service.findOneAsync(-1)).rejects.toThrow(BadRequestException);
      expect(service.findOneAsync(0)).rejects.toThrow(BadRequestException);
      expect(service.findOneAsync(NaN)).rejects.toThrow(BadRequestException);
    });
  
    it('Test Not found', () => {
      expect(service.findOneAsync(999999)).rejects.toThrow(NotFoundException);
    });

  })
  
  describe('updateAsync', () => {
    const id = 1;
    const updateDto: UpdateUserDto = {
      name: 'test',
      email: 'test@example.com',
      password: '12345678',
    };
  
    let service: UserService;
    let repository: Repository<User>;
    let queryRunner: any;
  
    beforeEach(() => {
      repository = {
        manager: {
          connection: {
            createQueryRunner: jest.fn(),
          },
          update: jest.fn(),
        },
        findOne: jest.fn(),
      } as any;
  
      queryRunner = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          update: jest.fn(),
        },
      };
  
      (repository.manager.connection.createQueryRunner as jest.Mock).mockReturnValue(queryRunner);
  
      service = new UserService(repository);
      jest.spyOn(service, 'findOneAsync').mockResolvedValue({ id, ...updateDto } as User);
      jest.spyOn(CryptoService, 'encrypt').mockResolvedValue('encrypted-password');
      (repository.findOne as jest.Mock).mockResolvedValue({ id, ...updateDto });
    });
  
    it('should call all necessary methods correctly', async () => {
      await service.updateAsync(id, { ...updateDto });
  
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(service.findOneAsync).toHaveBeenCalledWith(id);
      expect(CryptoService.encrypt).toHaveBeenCalledWith(updateDto.password);
      expect(queryRunner.manager.update).toHaveBeenCalledWith(User, id, {
        ...updateDto,
        password: 'encrypted-password',
      });
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id } });
      expect(queryRunner.release).toHaveBeenCalled();
    });
  
    it('should throw BadRequestException if password is missing', async () => {
      await expect(
        service.updateAsync(id, { name: 'Test', email: 'test@gmail.com' } as any)
      ).rejects.toThrow(BadRequestException);
    });
  
    it('should rollback transaction and throw InternalServerErrorException on failure', async () => {
      (queryRunner.manager.update as jest.Mock).mockRejectedValue(new Error('Update error'));
  
      await expect(service.updateAsync(id, updateDto)).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
  
  describe('removeAsync', () => {
    const id = 1;
  
    let service: UserService;
    let repository: Repository<User>;
    let queryRunner: any;
  
    beforeEach(() => {
      repository = {
        manager: {
          connection: {
            createQueryRunner: jest.fn(),
          },
        },
      } as any;
  
      queryRunner = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          delete: jest.fn(),
        },
      };
  
      (repository.manager.connection.createQueryRunner as jest.Mock).mockReturnValue(queryRunner);
  
      service = new UserService(repository);
      jest.spyOn(service, 'findOneAsync').mockResolvedValue({ id } as User);
    });
  
    it('should delete user and commit transaction', async () => {
      const result = await service.removeAsync(id);
  
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(service.findOneAsync).toHaveBeenCalledWith(id);
      expect(queryRunner.manager.delete).toHaveBeenCalledWith(User, id);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
      expect(result).toBe('User deleted');
    });
  
    it('should rollback transaction and throw on error', async () => {
      (queryRunner.manager.delete as jest.Mock).mockRejectedValue(new Error('Delete failed'));
  
      await expect(service.removeAsync(id)).rejects.toThrow(InternalServerErrorException);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
  
  
});
