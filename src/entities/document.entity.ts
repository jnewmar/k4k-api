import { Column, Entity } from 'typeorm';
import ModelEntity from './model.entity';

@Entity()
export default class Document extends ModelEntity {
    @Column()
    name: string;

    @Column()
    url: string;

    @Column()
    description: string;
}