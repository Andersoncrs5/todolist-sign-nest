import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { LoginUserDTO } from 'src/user/dto/login-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDTO } from 'src/user/dto/refresh-token.dto';
import { ApiBody } from '@nestjs/swagger';


@Controller('auth')
export class AuthController {
    constructor(private service: AuthService) {}

  @Post("login")
  @ApiBody({ type: LoginUserDTO })
  async login(@Body() user: LoginUserDTO){
    return await this.service.LoginAsync(user);
  }

  @Post()
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.service.createAsync(createUserDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req) {
    return await this.service.logout(req.user.sub);
  }

  @Post('refresh')
  @ApiBody({ type: RefreshTokenDTO })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDTO) {
    return await this.service.refreshToken(refreshTokenDto.refresh_token);
  }

}
