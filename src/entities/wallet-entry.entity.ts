import { Entity, Column  } from 'typeorm';
import ModelEntity from './model.entity';

@Entity()
export default class WalletEntry extends ModelEntity{
    @Column()
    walletUuid: string;

    @Column("datetime")
    date: Date;

    @Column()
    paymentId: string;
    
    @Column("float")
    amount: number;
    
    @Column()
    rideFirebaseId: string;

    @Column()
    eskolareOrderNumber: string;
}