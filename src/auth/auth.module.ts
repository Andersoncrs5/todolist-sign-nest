import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../user/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { RecoverPassword } from 'src/user/entities/recoverPassoword.entity';
import { UserMetricModule } from 'src/user_metric/user_metric.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    TypeOrmModule.forFeature([User, RecoverPassword]),
    UserMetricModule,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' },
    }),
  ], 
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports : [AuthService]
})
export class AuthModule {}
