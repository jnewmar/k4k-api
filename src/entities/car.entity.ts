import { Entity, Column  } from 'typeorm';
import ModelEntity from './model.entity';

@Entity()
export default class Car extends ModelEntity {
    @Column()
    brand: string;

    @Column()
    model: string;

    @Column()
    plate: string;

    @Column()
    color: string;

    @Column()
    description: string;

    @Column()
    year: number;

    @Column()
    driverId: string;
}