import { Module } from '@nestjs/common';
import { PusherService } from './pusher.service';
import { ConfigModule } from '../config/config.module';

@Module({
    imports: [ConfigModule],
    exports: [PusherService],
    providers: [PusherService],
})
export class PusherModule {}
