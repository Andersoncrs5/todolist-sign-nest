import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiBody({ type: CreateTaskDto})
  @HttpCode(HttpStatus.OK)
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req ) {
    return await this.taskService.create(createTaskDto, req.user.sub);
  }

  @Get('/findAllOfUser')
  @HttpCode(HttpStatus.OK)
  async findAllOfUser(@Req() req) {
    return await this.taskService.findAllOfUser(req.user.sub);
  }
  
  @Get('/change-status-task/:id')
  @HttpCode(HttpStatus.OK)
  async changeStatusTask(@Param('id') id: number ) {
    return await this.taskService.changeStatusTaskAsync(id);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.taskService.findOne(+id);
  }

  @Put(':id')
  @ApiBody({ type: UpdateTaskDto})
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.taskService.remove(+id);
  }
}


