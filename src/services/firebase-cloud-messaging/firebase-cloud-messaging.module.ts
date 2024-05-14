import { Module } from '@nestjs/common';
import { FirebaseCloudMessagingService } from './firebase-cloud-messaging.service';

@Module({
    exports: [FirebaseCloudMessagingService],
    providers: [FirebaseCloudMessagingService],
})
export class FirebaseCloudMessagingModule {}
