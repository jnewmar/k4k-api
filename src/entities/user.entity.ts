import { Column, Entity } from 'typeorm';
import Person from './person.entity';

@Entity()
export default class User extends Person {
    @Column()
    firebaseUid: string;

    @Column()
    email: string;

    @Column()
    indicationCode: string;

    @Column()
    ownIndicationCode: string;

    @Column()
    eskolareUuid: string;

    @Column()
    userPaymentId: string;

    @Column()
    deviceUuid: string;
}