import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { LoginUserDTO } from '../user/dto/login-user.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDTO } from '../user/dto/refresh-token.dto';
import { ApiBody } from '@nestjs/swagger';
import { RequestPasswordResetDto } from './dtos/RequestPasswordReset.dto';
import { ResetPasswordDto } from './dtos/ResetPassword.dto';

@Controller({ path:'auth', version: '1'})
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('forgot-password')
  @ApiBody({ type: RequestPasswordResetDto })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: RequestPasswordResetDto) {
    await this.service.requestPasswordReset(dto.email);
    return { message: 'E-mail send with successfully!!!' };
  }

  @Post('reset-password')
  @ApiBody({ type: ResetPasswordDto })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.service.resetPassword(dto.token, dto.password, dto.confirmPassword);
    return { message: 'Senha recovered with success!!' };
  }

  @Post("/login")
  @ApiBody({ type: LoginUserDTO })
  @HttpCode(HttpStatus.OK)
  async login(@Body() user: LoginUserDTO){
    return await this.service.loginAsync(user);
  }

  @Post("/register")
  @ApiBody({ type: CreateUserDto })
  @HttpCode(HttpStatus.CREATED)
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

  @Post('/receive-metric-by-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async receiveMetricByEmail(@Req() req) {
    return await this.service.receiveMetricByEmail(req.user.sub);
  }

}
