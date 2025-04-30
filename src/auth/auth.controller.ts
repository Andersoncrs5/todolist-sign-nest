import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { LoginUserDTO } from '../user/dto/login-user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDTO } from '../user/dto/refresh-token.dto';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post("/login")
  @ApiBody({ type: LoginUserDTO })
  @HttpCode(HttpStatus.OK)
  async login(@Body() user: LoginUserDTO){
    return await this.service.LoginAsync(user);
  }

  @Post("/register")
  @ApiBody({ type: CreateUserDto })
  @HttpCode(HttpStatus.OK)
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.service.createAsync(createUserDto);
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req) {
    return await this.service.logout(req.user.sub);
  }

  @Post('/refresh')
  @ApiBody({ type: RefreshTokenDTO })
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDTO) {
    return await this.service.refreshToken(refreshTokenDto.refresh_token);
  }

}
