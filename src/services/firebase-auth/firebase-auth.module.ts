import { Module } from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';

@Module({
    exports: [FirebaseAuthService],
    providers: [FirebaseAuthService]
})
export class FirebaseAuthModule {}
