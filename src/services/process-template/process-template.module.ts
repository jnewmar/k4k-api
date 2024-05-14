import { Module } from '@nestjs/common';
import { ProcessTemplateService } from './process-template.service';

@Module({
    providers: [ProcessTemplateService],
    exports: [ProcessTemplateService]
})
export class ProcessTemplateModule {}
