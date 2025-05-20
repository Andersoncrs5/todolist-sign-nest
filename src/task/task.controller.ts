import { Controller, Get, Post, Body, Put, Param, Delete, Req, UseGuards, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { Task } from './entities/task.entity';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({path: 'task', version: '1'})
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiBody({ type: CreateTaskDto})
  @HttpCode(HttpStatus.OK)
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req ) {
    return await this.taskService.create(createTaskDto, req.user.sub);
  }
  
  @Get('/my-tasks')
  async findAllOfUser(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Req() req
  ): Promise<Pagination<Task>> {
    const options: IPaginationOptions = {
      page: Number(page),
      limit: Number(limit),
    };
    return this.taskService.findAllOfUser(req.user.sub, options);
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


