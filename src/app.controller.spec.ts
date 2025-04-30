import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    // Mock do AppService
    const mockAppService = {
      getHello: jest.fn().mockReturnValue('Hello World!'), // Mock do método getHello
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppService, useValue: mockAppService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  // it('should return "Hello World!"', () => {
  //   expect(appController.getHello()).toBe('Hello World!');
  // });

  // it('should call AppService.getHello', () => {
  //   appController.getHello();
  //   expect(appService.getHello).toHaveBeenCalled();
  // });
});
