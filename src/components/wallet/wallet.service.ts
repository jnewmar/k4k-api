import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Wallet from '../../entities/wallet.entity';
import { Repository } from 'typeorm';
import WalletEntry from '../../entities/wallet-entry.entity';
import WalletWithdrawal from '../../entities/wallet-withdrawal.entity';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet) private walletRepository: Repository<Wallet>,
        @InjectRepository(WalletEntry) private walletEntryRepository: Repository<WalletEntry>,
        @InjectRepository(WalletWithdrawal) private walletWithdrawalRepository: Repository<WalletWithdrawal>
    ) {}

    public createWallet(): Promise<Wallet> {
        const wallet = this.walletRepository.create();
        return this.walletRepository.save(wallet);
    }

    public newEntry(walletUuid: string, date: Date, paymentId: string, amount: number, rideFirebaseId: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                const wallet =  await this.walletRepository.findOne({ where: { uuid:walletUuid } });
                const walletEntry = this.walletEntryRepository.create();
    
                walletEntry.walletUuid = walletUuid;
                walletEntry.amount = amount;
                walletEntry.paymentId = paymentId;
                walletEntry.date = date;
                walletEntry.rideFirebaseId = rideFirebaseId;

                const entrySaved = await this.walletEntryRepository.save(walletEntry);
                
                wallet.amountAvailable += amount;
                wallet.lastEntryUuid = entrySaved.uuid;

                this.walletRepository.save(wallet);

                return resolve();
            }catch(err) {
                return reject(err);
            }
        });
    }

    public newWithdrawal(amount: number, date: Date, walletUuid: string, bankDataUuid: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try{
                const wallet =  await this.walletRepository.findOne({ where: { uuid: walletUuid } });
                const walletWithdrawal = this.walletWithdrawalRepository.create();

                walletWithdrawal.amount = amount;
                walletWithdrawal.date = date;
                walletWithdrawal.walletUuid = walletUuid;
                walletWithdrawal.bankDataUuid = bankDataUuid;

                const withdrawalSaved = await this.walletWithdrawalRepository.save(walletWithdrawal);

                wallet.amountAvailable -= amount;
                wallet.lastWithdrawalUuid = withdrawalSaved.uuid;

                this.walletRepository.save(wallet);

                return resolve();
            }
            catch(err) {
                return reject(err);
            }
        });
    } 
}
