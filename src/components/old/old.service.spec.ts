import { Test, TestingModule } from '@nestjs/testing';
import { OldService } from './old.service';

describe('OldService', () => {
    let service: OldService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [OldService],
        }).compile();

        service = module.get<OldService>(OldService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
