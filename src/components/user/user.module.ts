import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { IuguModule } from '../payment-gateway/iugu/iugu.module';
import { ConfigModule } from '../../services/config/config.module';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
    imports: [IuguModule, FirebaseModule],
    providers: [ConfigModule],
    controllers: [UserController],
})
export class UserModule {}
