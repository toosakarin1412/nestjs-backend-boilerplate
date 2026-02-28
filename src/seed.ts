import dataSource from './config/dbconfig';
import { Role } from './modules/rbac/entities/role.entity';
import { Permission } from './modules/rbac/entities/permission.entity';
import { User } from './modules/users/entities/user.entity';

async function seed() {
    console.log('🌱 Starting database seeding...');
    
    try {
        await dataSource.initialize();
        console.log('Database connected.');

        const permissionRepo = dataSource.getRepository(Permission);
        const roleRepo = dataSource.getRepository(Role);
        const userRepo = dataSource.getRepository(User);

        // 1. Seed Permissions
        const permissionsData = [
            { name: 'users.create', description: 'Create user' },
            { name: 'users.read', description: 'Read user' },
            { name: 'users.update', description: 'Update user' },
            { name: 'users.delete', description: 'Delete user' },
            { name: 'roles.create', description: 'Create role' },
            { name: 'roles.read', description: 'Read role' },
            { name: 'roles.update', description: 'Update role' },
            { name: 'roles.delete', description: 'Delete role' },
            { name: 'permissions.read', description: 'Read permission' },
        ];

        console.log('Seeding permissions...');
        for (const p of permissionsData) {
            const exists = await permissionRepo.findOneBy({ name: p.name });
            if (!exists) {
                await permissionRepo.save(permissionRepo.create(p));
            }
        }

        // 2. Seed Roles
        const rolesData = [
            { name: 'superadmin', description: 'Super Admin with all permissions' },
            { name: 'admin', description: 'Administrator' },
            { name: 'user', description: 'Regular User' },
        ];

        console.log('Seeding roles...');
        for (const r of rolesData) {
            const exists = await roleRepo.findOneBy({ name: r.name });
            if (!exists) {
                await roleRepo.save(roleRepo.create(r));
            }
        }

        // 3. Assign all permissions to superadmin
        console.log('Assigning permissions to superadmin...');
        const superadmin = await roleRepo.findOneBy({ name: 'superadmin' });
        const allPermissions = await permissionRepo.find();
        
        if (superadmin) {
            superadmin.permissions = allPermissions;
            await roleRepo.save(superadmin);
        }

        // 4. Seed Superadmin User
        console.log('Seeding superadmin user...');
        const superadminEmail = 'superadmin@example.com';
        let adminUser = await userRepo.findOneBy({ email: superadminEmail });
        
        if (!adminUser && superadmin) {
            const newUser = userRepo.create({
                name: 'Super Admin',
                email: superadminEmail,
                password: 'password123', // Will be hashed by BeforeInsert hook
                role: superadmin,
            });
            await userRepo.save(newUser);
            console.log('Superadmin user created: email: superadmin@example.com, password: password123');
        } else {
            console.log('Superadmin user already exists.');
        }

        console.log('✅ Seeding completed successfully.');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        if (dataSource.isInitialized) {
            await dataSource.destroy();
            console.log('Database connection closed.');
        }
    }
}

seed();
