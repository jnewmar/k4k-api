import Model from './model';
import WalletEntry from './wallet-entry';
import WalletWithdrawal from './wallet-withdrawal';

export default class Wallet extends Model {
    userId: string;
    amountAvailable: number;
    lastEntry: WalletEntry;
    lastWithdrawal: WalletWithdrawal;
    entries: Array<WalletEntry>;
    withdrawals: Array<WalletWithdrawal>;
    nextWithdrawalAvailableDate: Date;
    lastWithdrawalAvailableDate: Date;
}
