import { Test, TestingModule } from '@nestjs/testing';
import { BolleService } from './bolle.service';

describe('BolleService', () => {
  let service: BolleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BolleService],
    }).compile();

    service = module.get<BolleService>(BolleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
