import { Module } from '@nestjs/common';
import { EmailDispatcherService } from './email-dispatcher.service';
import { ConfigModule } from '../config/config.module';

@Module({
    imports: [ConfigModule],
    exports: [EmailDispatcherService],
    providers: [EmailDispatcherService],
})
export class EmailDispatcherModule {}
