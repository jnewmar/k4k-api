import { Module } from '@nestjs/common';
import { TerminusOptionsService } from './terminus-options.service';
import { TerminusModule } from '@nestjs/terminus';

@Module({
    imports: [TerminusModule],
    providers: [TerminusOptionsService],
    exports: [TerminusOptionsService],
})
export class TerminusOptionsModule {}
