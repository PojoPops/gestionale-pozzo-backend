import { Test, TestingModule } from '@nestjs/testing';
import { PozziController } from './pozzi.controller';

describe('PozziController', () => {
  let controller: PozziController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PozziController],
    }).compile();

    controller = module.get<PozziController>(PozziController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
