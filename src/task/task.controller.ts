import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateTaskDto})
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req ) {
    return await this.taskService.create(createTaskDto, req.user.sub);
  }

  @Get('/findAllOfUser/:id')
  @UseGuards(JwtAuthGuard)
  async findAllOfUser(@Param('id') id: number ) {
    return await this.taskService.findAllOfUser(id);
  }
  
  @Get('/change-status-task/:id')
  @UseGuards(JwtAuthGuard)
  async changeStatusTask(@Param('id') id: number ) {
    return await this.taskService.changeStatusTaskAsync(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return await this.taskService.findOne(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateTaskDto})
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return await this.taskService.remove(+id);
  }
}


