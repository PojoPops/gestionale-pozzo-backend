import { Test, TestingModule } from '@nestjs/testing';
import { ClientiService } from './clienti.service';

describe('ClientiService', () => {
  let service: ClientiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientiService],
    }).compile();

    service = module.get<ClientiService>(ClientiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
