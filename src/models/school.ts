import Model from './model';
import Address from './address';

export default class School extends Model {
    registry: string;
    name: string;
    category: string;
    description: string;
    address: Address;
    eskolareUid: string;
}
