import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Wallet from '../../entities/wallet.entity';
import WalletEntry from '../../entities/wallet-entry.entity';
import WalletWithdrawal from '../../entities/wallet-withdrawal.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Wallet, WalletEntry, WalletWithdrawal])],
    providers: [WalletService],
    exports: [WalletService]
})
export class WalletModule {}
