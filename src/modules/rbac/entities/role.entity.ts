
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Permission } from './permission.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @ManyToMany(() => Permission, (permission) => permission.roles)
    @JoinTable()
    permissions: Permission[];

    @OneToMany(() => User, (user) => user.role)
    users: User[];

    totalUsers?: number;
}
