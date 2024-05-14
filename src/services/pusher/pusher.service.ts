import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import PusherEvent from './pusher-event.interface';

@Injectable()
export class PusherService {
    private pusher: any;

    constructor(private readonly config: ConfigService) {
        const Pusher = require('pusher');
        this.pusher = new Pusher(this.config.environment.Pusher);
    }

    public trigger(event: PusherEvent): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const result = this.pusher.trigger(event.channel, event.name, event.payload);
                resolve(result);
            } catch (err) {
                reject(err);
            }
        });
    }
}
