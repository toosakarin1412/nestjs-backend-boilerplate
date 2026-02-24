
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class RbacService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
    ) { }

    async createPermission(createPermissionDto: CreatePermissionDto): Promise<Permission> {
        const permission = this.permissionRepository.create(createPermissionDto);
        return this.permissionRepository.save(permission);
    }

    async findAllPermissions(): Promise<Permission[]> {
        return this.permissionRepository.find();
    }

    async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
        const { permissions, ...roleData } = createRoleDto;
        const role = this.roleRepository.create(roleData);

        if (permissions && permissions.length > 0) {
            const permissionEntities = await this.permissionRepository.findBy({
                id: In(permissions),
            });
            role.permissions = permissionEntities;
        }

        return this.roleRepository.save(role);
    }

    async findAllRoles(): Promise<Role[]> {
        // return this.roleRepository.find({ relations: ['permissions'] });
        return this.roleRepository.find();
    }

    async findRoleById(id: number): Promise<Role> {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions'],
        });
        if (!role) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
        return role;
    }

    async findRoleByName(name: string): Promise<Role> {
        const role = await this.roleRepository.findOne({ where: { name }, relations: ['permissions'] });
        if (!role) {
            throw new NotFoundException(`Role with name ${name} not found`);
        }
        return role;
    }

    async updateRole(id: number, createRoleDto: CreateRoleDto): Promise<Role> {
        const role = await this.findRoleById(id);
        const { permissions, ...roleData } = createRoleDto;

        Object.assign(role, roleData);

        if (permissions) {
            const permissionEntities = await this.permissionRepository.findBy({
                id: In(permissions),
            });
            role.permissions = permissionEntities;
        }

        return this.roleRepository.save(role);
    }

    async deleteRole(id: number): Promise<void> {
        const result = await this.roleRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Role with ID ${id} not found`);
        }
    }

    async addPermissionToRole(roleId: number, permissionId: number): Promise<Role> {
        const role = await this.findRoleById(roleId);
        const permission = await this.permissionRepository.findOne({ where: { id: permissionId } });

        if (!permission) {
            throw new NotFoundException(`Permission with ID ${permissionId} not found`);
        }

        const hasPermission = role.permissions.some(p => p.id === permission.id);
        if (!hasPermission) {
            role.permissions.push(permission);
            return this.roleRepository.save(role);
        }

        return role;
    }

    async removePermissionFromRole(roleId: number, permissionId: number): Promise<Role> {
        const role = await this.findRoleById(roleId);

        role.permissions = role.permissions.filter(p => p.id !== permissionId);
        return this.roleRepository.save(role);
    }

    async addPermissionsToRole(roleId: number, permissionIds: (number | string)[]): Promise<Role> {
        const role = await this.findRoleById(roleId);

        // Ensure all ID values are strictly parsed to numbers
        const validIds = permissionIds
            .map(id => Number(id))
            .filter(id => !isNaN(id));

        if (validIds.length === 0) {
            return role;
        }

        const permissionsToAdd = await this.permissionRepository.findBy({ id: In(validIds) });

        if (permissionsToAdd.length === 0) {
            return role;
        }

        const currentPermissionIds = new Set(role.permissions.map(p => p.id));
        const newPermissions = permissionsToAdd.filter(p => !currentPermissionIds.has(p.id));

        if (newPermissions.length > 0) {
            role.permissions.push(...newPermissions);
            return this.roleRepository.save(role);
        }

        return role;
    }

    async removePermissionsFromRole(roleId: number, permissionIds: (number | string)[]): Promise<Role> {
        const role = await this.findRoleById(roleId);

        // Ensure all ID values are strictly parsed to numbers
        const validIds = permissionIds
            .map(id => Number(id))
            .filter(id => !isNaN(id));

        if (validIds.length === 0) {
            return role;
        }

        const idsToRemove = new Set(validIds);

        const initialCount = role.permissions.length;
        role.permissions = role.permissions.filter(p => !idsToRemove.has(p.id));

        if (role.permissions.length !== initialCount) {
            return this.roleRepository.save(role);
        }

        return role;
    }
}
