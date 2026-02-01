import { Test, TestingModule } from '@nestjs/testing';
import { BolleController } from './bolle.controller';

describe('BolleController', () => {
  let controller: BolleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BolleController],
    }).compile();

    controller = module.get<BolleController>(BolleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
