import Model from './model';
import Address from './address';
import Document from './document';

export default class Person extends Model {
    name: string;
    CPF: string;
    RG: string;
    birthDate: Date;
    profilePhoto: string;
    phoneNumber: string;
    documents: Array<Document>;
    address: Address;
}
