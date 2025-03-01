import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('/:id_user')
  async create(@Body() createTaskDto: CreateTaskDto, @Param('id_user') id_user: number ) {
    return await this.taskService.create(createTaskDto, id_user);
  }

  @Get('/findAllOfUser/:id')
  async findAllOfUser(@Param('id') id: number ) {
    return await this.taskService.findAllOfUser(id);
  }
  
  @Get('/change-status-task/:id')
  async changeStatusTask(@Param('id') id: number ) {
    return await this.taskService.changeStatusTaskAsync(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.taskService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.taskService.remove(+id);
  }
}


