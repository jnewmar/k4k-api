import {Entity, Column } from 'typeorm';
import ModelEntity from './model.entity';

@Entity()
export default class Address extends ModelEntity {
    @Column()
    country: string;
    
    @Column()
    state: string;

    @Column()
    city: string;

    @Column()
    neighborhood: string;

    @Column()
    street: string;

    @Column()
    number: string;

    @Column()
    reference: string;

    @Column()
    addressType: string;

    @Column()
    complement: string;

    @Column()
    block: string;

    @Column("bigint")
    latitude: number;

    @Column("bigint")
    longitude: number;

    @Column()
    zipCode: string;

    @Column()
    fullAddressText: string;
}
