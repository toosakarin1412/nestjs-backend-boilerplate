import { MigrationInterface, QueryRunner } from "typeorm";
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { v7 as uuidv7 } from 'uuid';

export class SeedSuperadmin1766918000000 implements MigrationInterface {
    name = 'SeedSuperadmin1766918000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const salt = randomBytes(16);
        const hashedPassword = await argon2.hash('superadmin@example.com', { salt });
        const saltHex = salt.toString('hex');
        const userUuid = uuidv7();

        await queryRunner.query(
            `INSERT INTO \`user\` (user_uuid, email, password, role, salt) VALUES ('${userUuid}', 'superadmin@example.com', '${hashedPassword}', 'superadmin', '${saltHex}')`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM \`user\` WHERE email = 'superadmin@example.com'`);
    }

}
