import { Test, TestingModule } from '@nestjs/testing';
import { EskolareService } from './eskolare.service';

describe('EskolareService', () => {
    let service: EskolareService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EskolareService],
        }).compile();

        service = module.get<EskolareService>(EskolareService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
