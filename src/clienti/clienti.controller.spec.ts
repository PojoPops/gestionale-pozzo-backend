import { Test, TestingModule } from '@nestjs/testing';
import { ClientiController } from './clienti.controller';

describe('ClientiController', () => {
  let controller: ClientiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientiController],
    }).compile();

    controller = module.get<ClientiController>(ClientiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
