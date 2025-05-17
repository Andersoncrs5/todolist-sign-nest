import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { CryptoService } from '../../CryptoService';
import { LoginUserDTO } from 'src/user/dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  @Transactional()
  async loginAsync(userDto: LoginUserDTO): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.repository.findOne({ where: { email: userDto.email } });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordCorrect = await CryptoService.compare(userDto.password, user.password);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await this.repository.save(user);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  @Transactional()
  async createAsync(createUserDto: CreateUserDto) {
    const existingUser = await this.repository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('E-mail exists');
    }

    const user = this.repository.create(createUserDto);
    await this.repository.save(user);

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await this.repository.save(user);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  @Transactional()
  async logout(userId: number) {
    const user = await this.repository.findOne({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    user.refreshToken = null;
    await this.repository.save(user);

    return { message: 'Logout realizado com sucesso' };
  }

  @Transactional()
  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);

    const user = await this.repository.findOne({
      where: { id: payload.sub, refreshToken },
    });

    if (!user) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const newAccessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return { access_token: newAccessToken };
  }
}
