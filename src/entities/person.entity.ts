import { Column } from 'typeorm';
import ModelEntity from './model.entity';

export default class Person extends ModelEntity {
    @Column()
    name: string;

    @Column({unique: true})
    CPF: string;

    @Column()
    RG: string;

    @Column("datetime")
    birthDate: Date;

    @Column()
    profilePhoto: string;

    @Column()
    phoneNumber: string;

    @Column()
    addressUuid: string;
}