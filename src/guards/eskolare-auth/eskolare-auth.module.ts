import { Module } from '@nestjs/common';
import { ConfigModule } from '../../services/config/config.module';
import { EskolareAuthGuard } from './eskolare-auth.guard';

@Module({
    imports: [ConfigModule],
    providers: [EskolareAuthGuard],
    exports: [EskolareAuthGuard]
})
export class EskolareAuthModule {}
