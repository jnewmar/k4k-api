import { Module } from '@nestjs/common';
import { IuguService } from './iugu.service';
import { ConfigModule } from '../../../services/config/config.module';

@Module({
    imports: [ConfigModule],
    providers: [IuguService],
    exports: [IuguService],
})
export class IuguModule {}
