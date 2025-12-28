import { MigrationInterface, QueryRunner } from "typeorm";

export class UsersTable1766917657871 implements MigrationInterface {
    name = 'UsersTable1766917657871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`user_id\` int NOT NULL AUTO_INCREMENT, \`user_uuid\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`role\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, \`avatar\` varchar(255) NULL, \`salt\` varchar(255) NULL, INDEX \`IDX_20ba1ec1283433fc53a5311f16\` (\`user_uuid\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_20ba1ec1283433fc53a5311f16\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
