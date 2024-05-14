import { Test, TestingModule } from '@nestjs/testing';
import { EskolareController } from './eskolare.controller';

describe('Eskolare Controller', () => {
    let controller: EskolareController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EskolareController],
        }).compile();

        controller = module.get<EskolareController>(EskolareController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
