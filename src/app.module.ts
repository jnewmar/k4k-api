import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { CalculatorModule } from './components/calculator/calculator.module';
import { FirebaseModule } from './components/firebase/firebase.module';
import { UserModule } from './components/user/user.module';
import { TerminusModule } from '@nestjs/terminus';
import { RaceModule } from './components/race/race.module';
import { OldModule } from './components/old/old.module';
import { IuguModule } from './components/payment-gateway/iugu/iugu.module';
import { EskolareModule } from './components/eskolare/eskolare.module';

import { ServiceAccount, initializeApp, credential } from 'firebase-admin';
import { EskolareController } from './components/eskolare/eskolare.controller';
import { UserAuthMiddleware } from './middlewares/user-auth.middleware';
import { CalculatorController } from './components/calculator/calculator.controller';
import { FirebaseController } from './components/firebase/firebase.controller';
import { OldController } from './components/old/old.controller';
import { RaceController } from './components/race/race.controller';
import { UserController } from './components/user/user.controller';
import { PusherModule } from './services/pusher/pusher.module';
import { EmailDispatcherModule } from './services/email-dispatcher/email-dispatcher.module';
import { ConfigService } from './services/config/config.service';
import { ConfigModule } from './services/config/config.module';
import { FirebaseCloudMessagingModule } from './services/firebase-cloud-messaging/firebase-cloud-messaging.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminusOptionsService } from './services/terminus-options/terminus-options.service';
import { TerminusOptionsModule } from './services/terminus-options/terminus-options.module';
import { WalletModule } from './components/wallet/wallet.module';
import { ProcessTemplateModule } from './services/process-template/process-template.module';
import { DriverModule } from './components/driver/driver.module';
import { FirebaseAuthModule } from './services/firebase-auth/firebase-auth.module';
import { DriverController } from './components/driver/driver.controller';
import { EskolareAuthModule } from './guards/eskolare-auth/eskolare-auth.module';

const config = new ConfigService();

initializeApp({
    databaseURL: config.environment.FirebaseProjectCredentials.databaseURL,
    credential: credential.cert(config.environment.FirebaseProjectCredentials as ServiceAccount),
});

@Module({
    imports: [
        TypeOrmModule.forRoot(),
        CalculatorModule,
        FirebaseModule,
        UserModule,
        TerminusModule.forRootAsync({
            imports: [TerminusOptionsModule],
            useClass: TerminusOptionsService,
        }),
        RaceModule,
        ConfigModule,
        OldModule,
        IuguModule,
        EskolareModule,
        PusherModule,
        EmailDispatcherModule,
        FirebaseCloudMessagingModule,
        TerminusOptionsModule,
        WalletModule,
        ProcessTemplateModule,
        DriverModule,
        FirebaseAuthModule,
        EskolareAuthModule,
    ]
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(UserAuthMiddleware)
            .exclude(
                { path: 'eskolare/test', method: RequestMethod.GET },
                { path: 'eskolare/cancelOrder', method: RequestMethod.POST },
                { path: 'eskolare/createOrder', method: RequestMethod.POST },
                { path: 'eskolare/fulfillmentOrder', method: RequestMethod.POST },
                { path: 'eskolare/getOrder/:orderNumber', method: RequestMethod.GET }
            )
            .forRoutes(DriverController, CalculatorController, FirebaseController, OldController, RaceController, EskolareController, UserController);
    }
}
