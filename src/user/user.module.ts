import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { IuguService } from '../payment-gateway/iugu/iugu.service';
import { FirebaseService } from '../firebase/firebase.service';
import { ConfigService } from '../config/config.service';

@Module({
    providers: [IuguService, FirebaseService, ConfigService],
    controllers: [UserController],
})
export class UserModule {}
