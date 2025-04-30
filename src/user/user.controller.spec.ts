import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  // Mock do UserService
  const mockUserService = {
    findOneAsync: jest.fn(),
    updateAsync: jest.fn(),
    removeAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

//   describe('findOne', () => {
//     it('should return a user', async () => {
//       const mockUser = { id: 1, name: 'John Doe' };
//       mockUserService.findOneAsync.mockResolvedValue(mockUser);

//       const req = { user: { sub: 1 } }; // Simula o objeto req com o usuário autenticado
//       const result = await controller.findOne(req);

//       expect(result).toEqual(mockUser);
//       expect(userService.findOneAsync).toHaveBeenCalledWith(1); // Garante que o serviço foi chamado com o id correto
//     });
//   });

//   describe('update', () => {
//     it('should update the user and return the updated user', async () => {
//       const updateUserDto = { name: 'John Updated' };
//       const mockUpdatedUser = { id: 1, name: 'John Updated' };
//       mockUserService.updateAsync.mockResolvedValue(mockUpdatedUser);

//       const req = { user: { sub: 1 } }; // Simula o objeto req com o usuário autenticado
//       const result = await controller.update(req, updateUserDto);

//       expect(result).toEqual(mockUpdatedUser);
//       expect(userService.updateAsync).toHaveBeenCalledWith(1, updateUserDto); // Garante que o serviço foi chamado com o id correto e o DTO
//     });
//   });

//   describe('remove', () => {
//     it('should remove the user and return a success message', async () => {
//       const mockResponse = 'User deleted';
//       mockUserService.removeAsync.mockResolvedValue(mockResponse);

//       const req = { user: { sub: 1 } }; 
//       const result = await controller.remove(req);

//       expect(result).toEqual(mockResponse);
//       expect(userService.removeAsync).toHaveBeenCalledWith(1); // Garante que o serviço foi chamado com o id correto
//     });
//   });
});
