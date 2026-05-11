import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('Users')
export class User {
    @PrimaryGeneratedColumn()
    userId!: number;

    @Column({ length: 50, unique: true })
    username!: string;

    @Column({ length: 100, unique: true })
    email!: string;

    @Column({ length: 255 })
    passwordHash!: string;

    @Column({ length: 20 })
    role!: string; // 'Admin' or 'Voter'

    @Column({ length: 50 })
    firstName!: string;

    @Column({ length: 50 })
    lastName!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ default: true })
    isActive!: boolean;
}
