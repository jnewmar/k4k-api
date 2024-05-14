import { Module } from '@nestjs/common';
import { RaceService } from './race.service';
import { RaceController } from './race.controller';
import { ConfigModule } from '../../services/config/config.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
    imports: [FirebaseModule, ConfigModule],
    providers: [RaceService],
    controllers: [RaceController],
})
export class RaceModule {}
