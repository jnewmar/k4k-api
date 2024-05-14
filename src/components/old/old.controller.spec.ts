import { Test, TestingModule } from '@nestjs/testing';
import { OldController } from './old.controller';

describe('Old Controller', () => {
    let controller: OldController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [OldController],
        }).compile();

        controller = module.get<OldController>(OldController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
