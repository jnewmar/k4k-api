import { Test, TestingModule } from '@nestjs/testing';
import { ProcessTemplateService } from './process-template.service';

describe('ProcessTemplateService', () => {
  let service: ProcessTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessTemplateService],
    }).compile();

    service = module.get<ProcessTemplateService>(ProcessTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
