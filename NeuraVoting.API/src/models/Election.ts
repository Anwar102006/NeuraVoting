import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('Elections')
export class Election {
    @PrimaryGeneratedColumn()
    electionId!: number;

    @Column({ length: 150 })
    title!: string;

    @Column('text', { nullable: true })
    description!: string;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    // Constrained by DB to: 'Upcoming', 'Active', 'Completed', 'Cancelled'
    // 'Upcoming' acts as 'Pending'
    @Column({ length: 20 })
    status!: string; 

    @Column()
    createdByUserId!: number;

    @CreateDateColumn()
    createdAt!: Date;
}
