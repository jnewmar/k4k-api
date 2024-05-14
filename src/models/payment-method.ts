import Model from './model';

export default class PaymentMethod extends Model {
    token: string;
    type: string;
    userId: string;
}
