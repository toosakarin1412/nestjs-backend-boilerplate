import { MigrationInterface, QueryRunner } from "typeorm";

export class AuditLog1772318872872 implements MigrationInterface {
    name = 'AuditLog1772318872872'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (\`id\` varchar(36) NOT NULL, \`userId\` varchar(255) NULL, \`action\` varchar(255) NOT NULL, \`entity\` varchar(255) NOT NULL, \`metadata\` json NULL, \`ip_address\` varchar(45) NULL, \`user_agent\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`audit_logs\``);
    }

}
