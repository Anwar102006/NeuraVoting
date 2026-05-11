import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('Candidates')
export class Candidate {
    @PrimaryGeneratedColumn()
    candidateId!: number;

    @Column()
    electionId!: number;

    @Column({ length: 50 })
    firstName!: string;

    @Column({ length: 50 })
    lastName!: string;

    @Column({ length: 100, nullable: true })
    partyAffiliation!: string;

    @Column('text', { nullable: true })
    manifesto!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
