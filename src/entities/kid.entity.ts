import { Column, Entity } from 'typeorm';
import Person from './person.entity';

@Entity()
export default class Kid extends Person {
    @Column()
    allergies: string;
    
    @Column()
    hobbies: string;
    
    @Column()
    likes: string;
    
    @Column()
    nickname: string;
    
    @Column()
    specialNeeds: string;
    
    @Column()
    parentUuid: string;
} 