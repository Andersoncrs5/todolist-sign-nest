import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDTO } from './dto/login-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async findOne(@Req() req) {
    return await this.userService.findOneAsync(req.user.sub);
  }

  @Put()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: UpdateUserDto })
  async update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.updateAsync(req.user.sub, updateUserDto);
  }

  @Delete()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async remove(@Req() req) {
    return await this.userService.removeAsync(req.user.sub);
  }
}
