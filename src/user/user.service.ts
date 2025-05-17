import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CryptoService } from '../../CryptoService';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findOneAsync(id: number) {
    if (!id || id <= 0 || isNaN(id)) {
      throw new BadRequestException('User ID is required');
    }

    const user: User | null = await this.repository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Transactional()
  async updateAsync(id: number, updateUserDto: UpdateUserDto) {
    const user: User = await this.findOneAsync(id);

    if (!updateUserDto.password) {
      throw new BadRequestException('Password is required');
    }

    updateUserDto.password = await CryptoService.encrypt(updateUserDto.password);

    const userToUpdate = this.repository.create({
      ...user,
      ...updateUserDto,
      id: user.id,
      version: user.version,
    });

    return await this.repository.save(userToUpdate); 
  }

  @Transactional()
  async removeAsync(id: number) {
    await this.findOneAsync(id);
    await this.repository.delete(id);
    return 'User deleted';
  }
}