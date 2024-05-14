import { Column, PrimaryGeneratedColumn } from 'typeorm';

export default class ModelEntity {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @Column("datetime")
    creationDate: Date;

    @Column("datetime")
    lastUpdate: Date;

    @Column({ default: 'active' })
    status: string;
}
