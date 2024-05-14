import Model from './model';

export default class Address extends Model {
    country: string;
    state: string;
    city: string;
    neighborhood: string;
    street: string;
    number: string;
    reference: string;
    addressType: string;
    complement: string;
    block: string;
    latitude: number;
    longitude: number;
    zipCode: string;
    fullAddressText: string;
}
