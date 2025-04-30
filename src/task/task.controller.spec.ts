import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CreateTaskDto } from './dto/create-task.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let taskService: TaskService;

  // Mock do TaskService
  const mockTaskService = {
    create: jest.fn(),
    findAllOfUser: jest.fn(),
    changeStatusTaskAsync: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    taskService = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('create', () => {
  //   it('should create a task and return the task', async () => {
  //     const createTaskDto: CreateTaskDto = { title: 'Task 1', description: 'Description 1', done: false };
  //     const mockTask = { id: 1, ...createTaskDto };
  //     mockTaskService.create.mockResolvedValue(mockTask);

  //     const req = { user: { sub: 1 } }; // Simula o objeto req com o usuário autenticado
  //     const result = await controller.create(createTaskDto, req);

  //     expect(result).toEqual(mockTask);
  //     expect(taskService.create).toHaveBeenCalledWith(createTaskDto, 1); // Garante que o serviço foi chamado com o DTO correto e o id do usuário
  //   });
  // });

  // describe('findAllOfUser', () => {
  //   it('should return a list of tasks', async () => {
  //     const mockTasks = [{ id: 1, name: 'Task 1' }, { id: 2, name: 'Task 2' }];
  //     mockTaskService.findAllOfUser.mockResolvedValue(mockTasks);

  //     const req = { user: { sub: 1 } }; // Simula o objeto req com o usuário autenticado
  //     const result = await controller.findAllOfUser(req);

  //     expect(result).toEqual(mockTasks);
  //     expect(taskService.findAllOfUser).toHaveBeenCalledWith(1); // Garante que o serviço foi chamado com o id do usuário
  //   });
  // });

  // describe('changeStatusTask', () => {
  //   it('should change the status of a task and return the updated task', async () => {
  //     const mockTask = { id: 1, name: 'Task 1', done: false };
  //     mockTaskService.changeStatusTaskAsync.mockResolvedValue(mockTask);

  //     const result = await controller.changeStatusTask(1);

  //     expect(result).toEqual(mockTask);
  //     expect(taskService.changeStatusTaskAsync).toHaveBeenCalledWith(1); // Garante que o serviço foi chamado com o id correto
  //   });
  // });

  // describe('findOne', () => {
  //   it('should return a task', async () => {
  //     const mockTask = { id: 1, name: 'Task 1' };
  //     mockTaskService.findOne.mockResolvedValue(mockTask);

  //     const result = await controller.findOne('1');

  //     expect(result).toEqual(mockTask);
  //     expect(taskService.findOne).toHaveBeenCalledWith(1); // Garante que o serviço foi chamado com o id correto
  //   });
  // });

  // describe('update', () => {
  //   it('should update a task and return the updated task', async () => {
  //     const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
  //     const mockUpdatedTask = { id: 1, name: 'Updated Task' };
  //     mockTaskService.update.mockResolvedValue(mockUpdatedTask);

  //     const result = await controller.update('1', updateTaskDto);

  //     expect(result).toEqual(mockUpdatedTask);
  //     expect(taskService.update).toHaveBeenCalledWith(1, updateTaskDto); // Garante que o serviço foi chamado com o id correto e o DTO
  //   });
  // });

  // describe('remove', () => {
  //   it('should remove a task and return a success message', async () => {
  //     const mockResponse = 'Task deleted';
  //     mockTaskService.remove.mockResolvedValue(mockResponse);

  //     const result = await controller.remove('1');

  //     expect(result).toEqual(mockResponse);
  //     expect(taskService.remove).toHaveBeenCalledWith(1); // Garante que o serviço foi chamado com o id correto
  //   });
  // });
});
