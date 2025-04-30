import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      LoginAsync: jest.fn(),
      createAsync: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService }, // Mock do AuthService
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

//   it('should call LoginAsync on login', async () => {
//     const loginDto = { username: 'test', password: 'test' };
//     await controller.login(loginDto);
//     expect(service.LoginAsync).toHaveBeenCalledWith(loginDto);
//   });

//   it('should call createAsync on register', async () => {
//     const createUserDto = { username: 'test', password: 'test' };
//     await controller.register(createUserDto);
//     expect(service.createAsync).toHaveBeenCalledWith(createUserDto);
//   });

//   it('should call logout', async () => {
//     const req = { user: { sub: 1 } };
//     await controller.logout(req);
//     expect(service.logout).toHaveBeenCalledWith(req.user.sub);
//   });

//   it('should call refreshToken', async () => {
//     const refreshTokenDto = { refresh_token: 'sample_refresh_token' };
//     await controller.refreshToken(refreshTokenDto);
//     expect(service.refreshToken).toHaveBeenCalledWith(refreshTokenDto.refresh_token);
//   });
});
