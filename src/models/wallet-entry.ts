import Model from './model';

export default class WalletEntry extends Model {
    date: Date;
    paymentId: string;
    amount: number;
    rideId: string;
}
