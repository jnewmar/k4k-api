import { Entity, Column  } from 'typeorm';
import ModelEntity from './model.entity';

@Entity()
export default class BankData extends ModelEntity {
    @Column()
    name: string;

    @Column()
    bank: string;

    @Column()
    agency: string;

    @Column()
    accountNumber: string;

    @Column()
    registry: string;
}