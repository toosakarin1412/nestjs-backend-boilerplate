import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePasswordReset1772273800996 implements MigrationInterface {
    name = 'CreatePasswordReset1772273800996'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`password_reset\` (\`id\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`token_hash\` varchar(255) NOT NULL, \`expires_at\` timestamp NOT NULL, \`used_at\` timestamp NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`password_reset\``);
    }

}
