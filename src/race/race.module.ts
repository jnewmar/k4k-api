import { Module } from '@nestjs/common';
import { RaceService } from './race.service';
import { RaceController } from './race.controller';
import { ConfigService } from '../config/config.service';

@Module({
    providers: [RaceService, ConfigService],
    controllers: [RaceController],
})
export class RaceModule {}
