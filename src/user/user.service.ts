import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CryptoService } from 'CryptoService';
import { LoginUserDTO } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>
  ) {}

  async createAsync(createUserDto: CreateUserDto) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    
    try {
      const user = queryRunner.manager.create(User, createUserDto);
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOneAsync(id: number) {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const user: User | null = await this.repository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateAsync(id: number, updateUserDto: UpdateUserDto) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      if (!id) {
        throw new BadRequestException('Id is required');
      }

      const user: User | null = await queryRunner.manager.findOne(User, { where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if(!updateUserDto.password){
        throw new BadRequestException('Password is required')
      }

      updateUserDto.password = await CryptoService.encrypt(updateUserDto.password);
      await queryRunner.manager.update(User, id, updateUserDto);
      await queryRunner.commitTransaction();

      return await this.repository.findOne({ where: { id } }); 
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeAsync(id: number) {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      if (!id) {
        throw new BadRequestException('Id is required');
      }

      const user: User | null = await queryRunner.manager.findOne(User, { where: { id } });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await queryRunner.manager.delete(User, id);
      await queryRunner.commitTransaction();

      return 'User deleted';
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async LoginAsync(userDto: LoginUserDTO): Promise<boolean> {
    try {
      const email = userDto.email;
      const foundUser = await this.repository.findOne({ where: { email } });
  
      if (!foundUser) {
        return false;
      }
  
      const isPasswordCorrect = await CryptoService.compare(userDto.password, foundUser.password);
  
      if (!isPasswordCorrect) {
        return false;
      }
  
      return true;
    } catch (error) {
      throw error;
    }
  }  

}
