import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMailQueue1772265674476 implements MigrationInterface {
    name = 'CreateMailQueue1772265674476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`mail_queue\` (\`id\` varchar(36) NOT NULL, \`recipient\` varchar(255) NOT NULL, \`subject\` varchar(255) NOT NULL, \`template_id\` varchar(255) NOT NULL, \`payload\` json NOT NULL, \`status\` enum ('pending', 'processing', 'sent', 'failed') NOT NULL DEFAULT 'pending', \`attempts\` int NOT NULL DEFAULT '0', \`priority\` int NOT NULL DEFAULT '0', \`available_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`user_uuid\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`user_uuid\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_20ba1ec1283433fc53a5311f16\` ON \`user\` (\`user_uuid\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_20ba1ec1283433fc53a5311f16\` ON \`user\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`user_uuid\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`user_uuid\` varchar(36) NOT NULL`);
        await queryRunner.query(`DROP TABLE \`mail_queue\``);
    }

}
