import { Column, Entity } from 'typeorm';
import ModelEntity from './model.entity';

@Entity()
export default class Device extends ModelEntity {
    @Column()
    os: string;

    @Column()
    osVersionNumber: string;

    @Column()
    type: string;

    @Column()
    FCMToken: string;

    @Column()
    appVersion: string;

    @Column()
    deviceUuid: string;
}