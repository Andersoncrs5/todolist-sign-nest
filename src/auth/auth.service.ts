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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(RecoverPassword)
    private readonly recoverRepository: Repository<RecoverPassword>,
    private jwtService: JwtService,
    private readonly userService: UserService
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

    await this.sendEmailOfWelcome(createUserDto.email, createUserDto.name);
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

  @Transactional()
  async requestPasswordReset(email: string) {
    if (!email) throw new BadRequestException('Email é obrigatório');

    const user = await this.repository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

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
    const transporter = nodemailer.createTransport({
      service: String(process.env.SERVICE),
      auth: {
        user: String(process.env.EMAIL),
        pass: String(process.env.PASSWORD),
      }
    });

    if (token == null) { throw new BadRequestException('Token is required') }

    const filePath = path.join(process.cwd(), 'src', 'templates', 'reset-password-email.html');
    let html = fs.readFileSync(filePath, 'utf8')

    html = html.replace(/{{link}}/g, linkUrl);
    html = html.replace(/{{token}}/g, token);

    await transporter.sendMail({
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

    const transporter = nodemailer.createTransport({ 
      service: String(process.env.SERVICE),
      auth: {
        user: String(process.env.EMAIL),
        pass: String(process.env.PASSWORD),
      }
     })

    const filePath = path.join(process.cwd(), 'src', 'templates', 'welcome.email.html');

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Email template not found.');
    }

    let html = fs.readFileSync(filePath, 'utf8')
    const link = `http://localhost:${process.env.PORT}/task/my-tasks`;

    html = html.replace(/{{link}}/g, link);
    html = html.replace(/{{name}}/g, name);

    await transporter.sendMail({
      from: `"Support MyTask" ${process.env.EMAIL}`,
      to,
      subject: 'Welcome to MyTask',
      html
    });
  }

}