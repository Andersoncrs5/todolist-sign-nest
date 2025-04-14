import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoService } from 'CryptoService';
import { LoginUserDTO } from 'src/user/dto/login-user.dto';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
      @InjectRepository(User)
      private readonly repository: Repository<User>,
      private jwtService: JwtService,
    ){}

    async LoginAsync(userDto: LoginUserDTO): Promise<{
      access_token: string;
      refresh_token: string;
      }> {
      try {
        const email = userDto.email;
        const foundUser = await this.repository.findOne({ where: { email } });
    
        if (!foundUser) {
          throw new UnauthorizedException('Email in used');
        }
    
        const isPasswordCorrect = await CryptoService.compare(userDto.password, foundUser.password);
    
        if (!isPasswordCorrect) {
          throw new UnauthorizedException();
        }
    
        const payload = { sub: foundUser.id, email: foundUser.email };
        const accessToken = this.jwtService.sign(payload); 

        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        foundUser.refreshToken = refreshToken;
        await this.repository.save(foundUser);

        return { access_token: accessToken, refresh_token: refreshToken };
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(error)
      }
    
    }  

    async createAsync(createUserDto: CreateUserDto) {
      const queryRunner = this.repository.manager.connection.createQueryRunner();
      await queryRunner.connect(); 
      await queryRunner.startTransaction(); 
  
      try {
          
          const existingUser = await queryRunner.manager.findOne(User, {
              where: { email: createUserDto.email },
          });
  
          if (existingUser) {
              throw new ConflictException("E-mail exists");
          }
          
          const user = queryRunner.manager.create(User, createUserDto);
          await queryRunner.manager.save(user);
          
          const payload = { sub: user.id, email: user.email };
          const accessToken = this.jwtService.sign(payload);
          const refreshToken = this.jwtService.sign(payload, { expiresIn: "7d" });
  
          user.refreshToken = refreshToken;
          await queryRunner.manager.save(user);
  
          await queryRunner.commitTransaction(); 
  
          return { access_token: accessToken, refresh_token: refreshToken };
      } catch (error) {
          console.log(error);
          await queryRunner.rollbackTransaction(); 
          throw new InternalServerErrorException(error.message);
      } finally {
          await queryRunner.release(); 
      }
  }  

      async logout(userId: number) {
        const user = await this.repository.findOne({ where: { id: userId } });
    
        if (!user) {
          throw new UnauthorizedException('Usuário não encontrado');
        }
    
        user.refreshToken = null;
        await this.repository.save(user);
    
        return { message: 'Logout realizado com sucesso' };
      }
    
      async refreshToken(refreshToken: string) {
        try {
          const payload = this.jwtService.verify(refreshToken);
      
          const foundUser = await this.repository.findOne({
            where: { id: payload.sub, refreshToken },
          });
      
          if (!foundUser) {
            throw new UnauthorizedException('Refresh token inválido');
          }
      
          const newAccessToken = this.jwtService.sign(
            { sub: foundUser.id, email: foundUser.email }
          );
      
          return { access_token: newAccessToken };
        } catch (error) {
          console.log(error);
          throw new UnauthorizedException('Refresh token inválido ou expirado');
        }
      }

}
