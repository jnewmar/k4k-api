import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';

@Module({
    exports: [FirebaseService],
    providers: [FirebaseService],
    controllers: [FirebaseController],
})
export class FirebaseModule {}
