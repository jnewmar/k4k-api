import Message from './message';
import Model from './model';

export default class Chat extends Model {
    from: string;
    type: string;
    rideId: string;
    members: Array<string>;
    messages: Array<Message>;
}
