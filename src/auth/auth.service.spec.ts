import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CryptoService } from '../../CryptoService'; // Supondo que CryptoService está em um caminho assim
import { LoginUserDTO } from 'src/user/dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let repository: Repository<User>;
  let cryptoService: CryptoService;

  beforeEach(async () => {
    // Mock do JwtService
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    // Mock do Repository (para User)
    const mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    // Mock do CryptoService
    const mockCryptoService = {
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: CryptoService, useValue: mockCryptoService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    cryptoService = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

//   it('should call LoginAsync and return access and refresh tokens', async () => {
//     const loginDto: LoginUserDTO = { email: 'test@test.com', password: 'password' };
//     const mockUser = { id: 1, email: 'test@test.com', password: 'hashedpassword' };
    
//     repository.findOne.mockResolvedValue(mockUser);
//     cryptoService.compare.mockResolvedValue(true);
//     jwtService.sign.mockReturnValue('access_token');
//     jwtService.sign.mockReturnValue('refresh_token');
    
//     const result = await service.LoginAsync(loginDto);
    
//     expect(repository.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email } });
//     expect(cryptoService.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
//     expect(jwtService.sign).toHaveBeenCalledTimes(2);
//     expect(result).toEqual({ access_token: 'access_token', refresh_token: 'refresh_token' });
//   });

//   it('should throw UnauthorizedException if user not found in LoginAsync', async () => {
//     const loginDto: LoginUserDTO = { email: 'test@test.com', password: 'password' };

//     repository.findOne.mockResolvedValue(null); // Simulando usuário não encontrado
    
//     await expect(service.LoginAsync(loginDto)).rejects.toThrow(UnauthorizedException);
//   });

//   it('should throw UnauthorizedException if password is incorrect in LoginAsync', async () => {
//     const loginDto: LoginUserDTO = { email: 'test@test.com', password: 'password' };
//     const mockUser = { id: 1, email: 'test@test.com', password: 'hashedpassword' };

//     repository.findOne.mockResolvedValue(mockUser);
//     cryptoService.compare.mockResolvedValue(false); // Senha incorreta
    
//     await expect(service.LoginAsync(loginDto)).rejects.toThrow(UnauthorizedException);
//   });

//   it('should call createAsync and return access and refresh tokens', async () => {
//     const createUserDto: CreateUserDto = { email: 'test@test.com', password: 'password' };
//     const mockUser = { id: 1, email: 'test@test.com', password: 'hashedpassword' };
    
//     repository.findOne.mockResolvedValue(null); // Nenhum usuário existente
//     repository.create.mockReturnValue(mockUser);
//     repository.save.mockResolvedValue(mockUser);
//     jwtService.sign.mockReturnValue('access_token');
//     jwtService.sign.mockReturnValue('refresh_token');
    
//     const result = await service.createAsync(createUserDto);

//     expect(repository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
//     expect(repository.create).toHaveBeenCalledWith(createUserDto);
//     expect(jwtService.sign).toHaveBeenCalledTimes(2);
//     expect(result).toEqual({ access_token: 'access_token', refresh_token: 'refresh_token' });
//   });

//   it('should throw ConflictException if email already exists in createAsync', async () => {
//     const createUserDto: CreateUserDto = { email: 'test@test.com', password: 'password' };
//     const mockUser = { id: 1, email: 'test@test.com', password: 'hashedpassword' };

//     repository.findOne.mockResolvedValue(mockUser); // Simulando que o usuário já existe
    
//     await expect(service.createAsync(createUserDto)).rejects.toThrow(ConflictException);
//   });

//   it('should call logout and return success message', async () => {
//     const mockUser = { id: 1, email: 'test@test.com', refreshToken: 'old_token' };
//     const userId = 1;

//     repository.findOne.mockResolvedValue(mockUser);
//     repository.save.mockResolvedValue(mockUser);

//     const result = await service.logout(userId);
    
//     expect(repository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
//     expect(repository.save).toHaveBeenCalledWith({ ...mockUser, refreshToken: null });
//     expect(result).toEqual({ message: 'Logout realizado com sucesso' });
//   });

//   it('should throw UnauthorizedException if user not found in logout', async () => {
//     const userId = 1;
//     repository.findOne.mockResolvedValue(null); // Simulando usuário não encontrado
    
//     await expect(service.logout(userId)).rejects.toThrow(UnauthorizedException);
//   });

//   it('should return new access token when refreshToken is valid', async () => {
//     const refreshToken = 'valid_refresh_token';
//     const mockUser = { id: 1, email: 'test@test.com', refreshToken };

//     jwtService.verify.mockReturnValue({ sub: 1, email: 'test@test.com' });
//     repository.findOne.mockResolvedValue(mockUser);
//     jwtService.sign.mockReturnValue('new_access_token');
    
//     const result = await service.refreshToken(refreshToken);
    
//     expect(jwtService.verify).toHaveBeenCalledWith(refreshToken);
//     expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email });
//     expect(result).toEqual({ access_token: 'new_access_token' });
//   });

//   it('should throw UnauthorizedException if refreshToken is invalid', async () => {
//     const refreshToken = 'invalid_refresh_token';
//     jwtService.verify.mockImplementation(() => {
//       throw new Error('invalid');
//     });

//     await expect(service.refreshToken(refreshToken)).rejects.toThrow(UnauthorizedException);
//   });
});
