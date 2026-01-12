import { Entity, PrimaryGeneratedColumn, Column, Index, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../../rbac/entities/role.entity';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { v7 as uuidv7 } from 'uuid';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Index()
    @Column()
    user_uuid: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @ManyToOne(() => Role, { eager: true })
    @JoinColumn({ name: 'role_id' })
    role: Role;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ nullable: true })
    salt: string;

    @BeforeInsert()
    async beforeInsert() {
        if (!this.user_uuid) {
            this.user_uuid = uuidv7();
        }
        if (this.password) {
            const salt = randomBytes(16);
            this.salt = salt.toString('hex');
            this.password = await argon2.hash(this.password, { salt });
        }
    }
}
