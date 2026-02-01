import { Test, TestingModule } from '@nestjs/testing';
import { PozziService } from './pozzi.service';

describe('PozziService', () => {
  let service: PozziService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PozziService],
    }).compile();

    service = module.get<PozziService>(PozziService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
