import { Entity, Column } from 'typeorm';
import ModelEntity from './model.entity';

@Entity()
export default class Wallet extends ModelEntity{ 
    @Column({ default: 0 })
    amountAvailable: number;

    @Column()
    lastEntryUuid: string;

    @Column()
    lastWithdrawalUuid: string;

    @Column("datetime")
    nextWithdrawalAvailableDate: Date;

    @Column("datetime")
    lastWithdrawalAvailableDate: Date;
}
