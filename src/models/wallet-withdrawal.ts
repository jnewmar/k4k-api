import Model from './model';
import BankData from './bank-data';

export default class WalletWithdrawal extends Model {
    date: Date;
    amount: number;
    bankData: BankData;
}
