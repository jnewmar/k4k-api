import { Module } from '@nestjs/common';
import { OldController } from './old.controller';
import { FirebaseService } from '../firebase/firebase.service';
import { ConfigModule } from '../../services/config/config.module';
import { FirebaseCloudMessagingModule } from '../../services/firebase-cloud-messaging/firebase-cloud-messaging.module';
import { IuguModule } from '../payment-gateway/iugu/iugu.module';
import { WalletModule } from '../wallet/wallet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import Driver from '../../entities/driver.entity';
import Address from '../../entities/address.entity';
import BankData from '../../entities/bank-data.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Driver, Address, BankData]),
        IuguModule, ConfigModule, FirebaseCloudMessagingModule, WalletModule],
    providers: [FirebaseService],
    controllers: [OldController],
})
export class OldModule {}
