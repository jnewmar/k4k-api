import { Test, TestingModule } from '@nestjs/testing';
import { EmailDispatcherService } from './email-dispatcher.service';

describe('EmailDispatcherService', () => {
    let service: EmailDispatcherService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EmailDispatcherService],
        }).compile();

        service = module.get<EmailDispatcherService>(EmailDispatcherService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
