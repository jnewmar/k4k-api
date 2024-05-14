import Person from './person';
import Kid from './kid';
import PaymentMethod from './payment-method';

export default class User extends Person {
    email: string;
    indicationCode: string;
    ownIndicationCode: string;
    userCameFrom: string;
    kids: Array<Kid>;
    chats: Array<string>;
    paymentMethods: Array<PaymentMethod>;
    eskolareUid: string;
}
