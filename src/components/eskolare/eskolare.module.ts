import { Module, HttpModule } from '@nestjs/common';
import { EskolareService } from './eskolare.service';
import { EskolareController } from './eskolare.controller';
import { ConfigModule } from '../../services/config/config.module';
import { PusherModule } from '../../services/pusher/pusher.module';
import { EmailDispatcherModule } from '../../services/email-dispatcher/email-dispatcher.module';
import { ProcessTemplateModule } from '../../services/process-template/process-template.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseModule } from '../firebase/firebase.module';
import EskolareProduct from '../../entities/eskolare-product.entity';
import Address from '../../entities/address.entity';
import { EskolareAuthModule } from '../../guards/eskolare-auth/eskolare-auth.module';

@Module({
    imports: [TypeOrmModule.forFeature([
        Address,
        EskolareProduct,
    ]), 
        EskolareAuthModule,
        HttpModule,
        FirebaseModule, 
        ConfigModule, 
        EmailDispatcherModule, 
        PusherModule, 
        ProcessTemplateModule
    ],
    providers: [EskolareService],
    controllers: [EskolareController],
})
export class EskolareModule {}
