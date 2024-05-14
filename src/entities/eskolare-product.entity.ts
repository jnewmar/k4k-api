import { Entity, Column } from 'typeorm';
import ModelEntity from './model.entity';

@Entity()
export default class EskolareProduct extends ModelEntity {
    @Column()
    type: string;

    @Column()
    registry: string;
    
    @Column()
    title: string;

    @Column()
    subtitle: string;

    @Column()
    name: string;

    @Column()
    upc: string;

    @Column("datetime")
    publicationDate: Date;
    
    @Column()
    category: string;
    
    @Column()
    description: string;
    
    @Column()
    addressUuid: string;

    @Column()
    eskolareUuid: string;

    @Column()
    local: string;

    @Column()
    activitiesPerWeek: string;

    @Column("float")
    price: number;

    @Column()
    class: string;

    @Column()
    serviceType: string;
}
