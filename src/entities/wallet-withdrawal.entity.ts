import { Entity, Column } from 'typeorm';
import ModelEntity from './model.entity';

@Entity()
export default class WalletWithdrawal extends ModelEntity{
    @Column("datetime")
    date: Date;

    @Column("float")
    amount: number;

    @Column()
    bankDataUuid: string;

    @Column()
    walletUuid: string;
}