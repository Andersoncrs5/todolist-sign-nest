import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';
import * as path from 'path';
import { CryptoService } from '../../CryptoService';
import { LoginUserDTO } from 'src/user/dto/login-user.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { Transactional } from 'typeorm-transactional';
import * as nodemailer from 'nodemailer';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { RecoverPassword } from 'src/user/entities/recoverPassoword.entity';
import { randomUUID } from 'crypto';
import { isUUID } from 'class-validator';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { ResponseToken } from './responses/responseTokens';
import { UserMetricService } from 'src/user_metric/user_metric.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(RecoverPassword)
    private readonly recoverRepository: Repository<RecoverPassword>,
    private jwtService: JwtService,
    private readonly userService: UserService,
    private readonly metricService: UserMetricService
  ) {}

  private readonly transporter = nodemailer.createTransport({
      service: String(process.env.SERVICE),
      auth: {
        user: String(process.env.EMAIL),
        pass: String(process.env.PASSWORD),
      }
    });

  @Transactional()
  async loginAsync(userDto: LoginUserDTO) {
    const user = await this.repository.findOne({ where: { email: userDto.email } });

    if (!user) throw new UnauthorizedException();

    const isPasswordCorrect = await CryptoService.compare(userDto.password, user.password);
    if (!isPasswordCorrect) throw new UnauthorizedException();

    const payload = { sub: user.id, email: user.email };


    const accessToken = this.jwtService.sign(payload, { expiresIn: process.env.JWT_EXPIRE_ACCESS_TOKEN });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: process.env.JWT_EXPIRE_REFRESH_TOKEN });

    user.refreshToken = refreshToken;
    await this.repository.save(user);

    const metric = await this.metricService.findOne(user)
    metric.lastLoginAt = new Date()
    await this.metricService.update(user, metric);

    const expireAtAccessToken = new Date(Date.now() + Number(process.env.JWT_EXPIRE_ACCESS_TOKEN));
    const expireAtRefreshToken = new Date(Date.now() + Number(process.env.JWT_EXPIRE_REFRESH_TOKEN));

    return new ResponseToken(accessToken, refreshToken, expireAtAccessToken, expireAtRefreshToken);
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
    const userSave = await this.repository.save(user);

    const expireAtAccessToken = new Date(Date.now() + Number(process.env.JWT_EXPIRE_ACCESS_TOKEN));
    const expireAtRefreshToken = new Date(Date.now() + Number(process.env.JWT_EXPIRE_REFRESH_TOKEN));

    await this.sendEmailOfWelcome(createUserDto.email, createUserDto.name);
    await this.metricService.create(userSave);
    return new ResponseToken(accessToken, refreshToken, expireAtAccessToken, expireAtRefreshToken);
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

  @Transactional()
  async requestPasswordReset(email: string) {
    if (!email) throw new BadRequestException('Email is required');

    const user = await this.repository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    await this.recoverRepository.delete({ user: { id: user.id } });

    const token = randomUUID();

    const expireAt = new Date(Date.now() + 30 * 60 * 1000); 

    const recover = this.recoverRepository.create({
      token,
      expireAt,
      user,
    });

    await this.recoverRepository.save(recover);

    const link = `http://localhost:${process.env.PORT}/reset-password`;
    await this.sendResetEmail(user.email, link, token);
  }

  async sendResetEmail(to: string, linkUrl: string, token: string) {
    

    if (token == null) { throw new BadRequestException('Token is required') }

    const filePath = path.join(process.cwd(), 'src', 'templates', 'reset-password-email.html');
    let html = fs.readFileSync(filePath, 'utf8')

    html = html.replace(/{{link}}/g, linkUrl);
    html = html.replace(/{{token}}/g, token);

    await this.transporter.sendMail({
      from: `"Support MyTask" <${process.env.EMAIL}>`,
      to,
      subject: 'Recupere sua senha',
      html
    });
  }

  @Transactional()
  async resetPassword(token: string, password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new BadRequestException('As senhas não coincidem');
    }

    if (!token || !isUUID(token)) {
      throw new BadRequestException('Token inválido');
    }

    const recover = await this.recoverRepository.findOne({
      where: { token },
      relations: ['user'], 
    });

    if (!recover) {
      throw new NotFoundException('Token not found');
    }

    if (recover.used) {
      throw new BadRequestException('Token already used!');
    }

    if (recover.expireAt.getTime() < Date.now()) {
      throw new BadRequestException('Token expired!');
    }

    const data: UpdateUserDto = { 
      email: recover.user.email,
      password,
      name: recover.user.name,
      version: recover.user.version,
     }

    await this.userService.updateAsync(recover.user.id, data);

    recover.used = true;
    await this.recoverRepository.save(recover);
  }

  async sendEmailOfWelcome(to: string, name: string) {
    if (!to || !name ) { throw new NotFoundException('Error the send email of welcome') }

    const filePath = path.join(process.cwd(), 'src', 'templates', 'welcome.email.html');

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Email template not found.');
    }

    let html = fs.readFileSync(filePath, 'utf8')
    const link = `http://localhost:${process.env.PORT}/task/my-tasks`;

    html = html.replace(/{{link}}/g, link);
    html = html.replace(/{{name}}/g, name);

    await this.transporter.sendMail({
      from: `"Support MyTask" ${process.env.EMAIL}`,
      to,
      subject: 'Welcome to MyTask',
      html
    });
  }

  @Transactional()
  async receiveMetricByEmail(id: number) {
    const user = await this.userService.findOneAsync(id);
    const metric = await this.metricService.findOne(user);
    metric.wishReceiveMetricByEmail = !metric.wishReceiveMetricByEmail
    metric.version = metric.version

    await this.metricService.update(user, metric);

    return {
      message: 'Status change with success!',
      status: metric.wishReceiveMetricByEmail
    }
  }

}