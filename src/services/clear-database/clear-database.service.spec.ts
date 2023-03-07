import { Test, TestingModule } from '@nestjs/testing';
import { ClearDatabaseService } from './clear-database.service';

describe('ClearDatabaseService', () => {
  let service: ClearDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClearDatabaseService],
    }).compile();

    service = module.get<ClearDatabaseService>(ClearDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
