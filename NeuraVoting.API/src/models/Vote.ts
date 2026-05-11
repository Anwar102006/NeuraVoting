import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('Votes')
export class Vote {
    @PrimaryColumn()
    electionId!: number;

    @PrimaryColumn()
    blockIndex!: number;

    @Column({ length: 256 })
    voterId!: string;

    @Column()
    candidateId!: number;

    @Column({ length: 256 })
    previousHash!: string;

    @Column({ length: 256 })
    currentHash!: string;

    @CreateDateColumn()
    timestamp!: Date;
}
