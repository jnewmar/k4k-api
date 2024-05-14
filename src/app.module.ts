import { Module } from '@nestjs/common';
import { CalculatorModule } from './calculator/calculator.module';
import { FirebaseModule } from './firebase/firebase.module';
import { UserModule } from './user/user.module';
import { TerminusModule } from '@nestjs/terminus';
import { TerminusOptionsService } from './terminus-options.service';
import { RaceModule } from './race/race.module';
import { ConfigModule } from './config/config.module';

@Module({
    imports: [
        CalculatorModule,
        FirebaseModule,
        UserModule,
        TerminusModule.forRootAsync({
            useClass: TerminusOptionsService,
        }),
        RaceModule,
        ConfigModule,
    ],
})
export class AppModule {}
