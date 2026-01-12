import { MigrationInterface, QueryRunner } from "typeorm";

export class Rbac1768215022871 implements MigrationInterface {
    name = 'Rbac1768215022871'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`role\` \`role_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`CREATE TABLE \`permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, UNIQUE INDEX \`IDX_240853a0c3353c25fb12434ad3\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, UNIQUE INDEX \`IDX_ae4578dcaed5adff96595e6166\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role_permissions_permission\` (\`roleId\` int NOT NULL, \`permissionId\` int NOT NULL, INDEX \`IDX_b36cb2e04bc353ca4ede00d87b\` (\`roleId\`), INDEX \`IDX_bfbc9e263d4cea6d7a8c9eb3ad\` (\`permissionId\`), PRIMARY KEY (\`roleId\`, \`permissionId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`DROP INDEX \`IDX_20ba1ec1283433fc53a5311f16\` ON \`user\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`phone\` \`phone\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`salt\` \`salt\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`role_id\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`role_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_fb2e442d14add3cefbdf33c4561\` FOREIGN KEY (\`role_id\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions_permission\` ADD CONSTRAINT \`FK_b36cb2e04bc353ca4ede00d87b9\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_permissions_permission\` ADD CONSTRAINT \`FK_bfbc9e263d4cea6d7a8c9eb3ad2\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Add superadmin role
        await queryRunner.query(`INSERT INTO \`role\` (name, description) VALUES ('superadmin', 'Superadmin role')`);

        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('users.create', 'Create user')`);
        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('users.read', 'Read user')`);
        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('users.update', 'Update user')`);
        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('users.delete', 'Delete user')`);

        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('roles.create', 'Create role')`);
        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('roles.read', 'Read role')`);
        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('roles.update', 'Update role')`);
        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('roles.delete', 'Delete role')`);

        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('permissions.create', 'Create permission')`);
        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('permissions.read', 'Read permission')`);
        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('permissions.update', 'Update permission')`);
        await queryRunner.query(`INSERT INTO \`permission\` (name, description) VALUES ('permissions.delete', 'Delete permission')`);

        // Add all permissions to superadmin role
        await queryRunner.query(`INSERT INTO \`role_permissions_permission\` (roleId, permissionId) SELECT \`role\`.id, \`permission\`.id FROM \`role\` JOIN \`permission\` ON \`permission\`.name != 'superadmin'`);

        // Add superadmin to user
        await queryRunner.query(`UPDATE \`user\` SET \`role_id\` = (SELECT \`role\`.id FROM \`role\` WHERE \`role\`.name = 'superadmin') WHERE \`email\` = 'superadmin@example.com'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`role_permissions_permission\` DROP FOREIGN KEY \`FK_bfbc9e263d4cea6d7a8c9eb3ad2\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions_permission\` DROP FOREIGN KEY \`FK_b36cb2e04bc353ca4ede00d87b9\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_fb2e442d14add3cefbdf33c4561\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`role_id\``);
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`role_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`salt\` \`salt\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`phone\` \`phone\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`CREATE INDEX \`IDX_20ba1ec1283433fc53a5311f16\` ON \`user\` (\`user_uuid\`)`);
        await queryRunner.query(`DROP INDEX \`IDX_bfbc9e263d4cea6d7a8c9eb3ad\` ON \`role_permissions_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_b36cb2e04bc353ca4ede00d87b\` ON \`role_permissions_permission\``);
        await queryRunner.query(`DROP TABLE \`role_permissions_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_ae4578dcaed5adff96595e6166\` ON \`role\``);
        await queryRunner.query(`DROP TABLE \`role\``);
        await queryRunner.query(`DROP INDEX \`IDX_240853a0c3353c25fb12434ad3\` ON \`permission\``);
        await queryRunner.query(`DROP TABLE \`permission\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`role_id\` \`role\` varchar(255) NOT NULL`);
    }
}
