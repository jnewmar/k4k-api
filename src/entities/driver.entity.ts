import { Entity, Column } from 'typeorm';
import Person from './person.entity';

@Entity()
export default class Driver extends Person {
    @Column()
    firebaseUid: string;

    @Column()
    email: string;

    @Column()
    indicationCode: string;

    @Column()
    ownIndicationCode: string;

    @Column()
    haveCarSeat: boolean;

    @Column()
    haveLiftSeat: boolean;
    
    @Column()
    availableToRides: boolean;
    
    @Column()
    inRide: boolean;
    
    @Column()
    currentRace: string;
    
    @Column()
    userCameFrom: string;
    
    @Column()
    bankDataUuid: string;
    
    @Column()
    walletUuid: string;

    @Column()
    deviceUuid: string;
}