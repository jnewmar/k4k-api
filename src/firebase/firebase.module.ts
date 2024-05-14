import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { ConfigService } from '../config/config.service';

@Module({
    providers: [FirebaseService, ConfigService],
    controllers: [FirebaseController],
})
export class FirebaseModule {}
