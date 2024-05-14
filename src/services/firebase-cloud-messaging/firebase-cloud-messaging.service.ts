import { Injectable } from '@nestjs/common';
import { messaging } from 'firebase-admin';
import MessageOptions from './interfaces/message-options.inteface';

@Injectable()
export class FirebaseCloudMessagingService {
    private messaging: messaging.Messaging;
    private options: messaging.MessagingOptions = { priority: 'high' };

    constructor() {
        this.messaging = messaging();
    }

    public sendNotification(messageOptions: MessageOptions): Promise<messaging.MessagingDevicesResponse> {
        const payload: messaging.MessagingPayload = {
            notification: {
                title: messageOptions.notificationTitle,
                body: messageOptions.notificationMessage,
                icon: messageOptions.notificationIcon || 'icon_notification',
                sound: messageOptions.notificationSound || 'default',
            },
            data: {
                notificationTitle: messageOptions.notificationTitle,
                body: JSON.stringify(messageOptions.data),
            },
        };

        return this.messaging.sendToDevice(messageOptions.tokens, payload, this.options);
    }
}
