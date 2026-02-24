
import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Logger } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';
// import { CreatePermissionDto } from './dto/create-permission.dto';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(JwtGuard, PermissionsGuard)
export class RbacController {
    constructor(private readonly rbacService: RbacService) { }

    private readonly logger = new Logger(RbacController.name);

    // @Post('permissions')
    // @ApiOperation({ summary: 'Create a new permission' })
    // @Permissions('permissions.create')
    // createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    //     return this.rbacService.createPermission(createPermissionDto);
    // }

    @Get('permissions')
    @ApiOperation({ summary: 'Get all permissions' })
    @Permissions('permissions.read')
    findAllPermissions() {
        return this.rbacService.findAllPermissions();
    }

    @Post('roles')
    @ApiOperation({ summary: 'Create a new role' })
    @Permissions('roles.create')
    createRole(@Body() createRoleDto: CreateRoleDto) {
        return this.rbacService.createRole(createRoleDto);
    }

    @Get('roles')
    @ApiOperation({ summary: 'Get all roles' })
    @Permissions('roles.read')
    findAllRoles() {
        return this.rbacService.findAllRoles();
    }

    @Get('roles/:id')
    @ApiOperation({ summary: 'Get a role by ID' })
    @Permissions('roles.read')
    findOneRole(@Param('id') id: string) {
        return this.rbacService.findRoleById(+id);
    }

    @Put('roles/:id')
    @ApiOperation({ summary: 'Update a role' })
    @Permissions('roles.update')
    updateRole(@Param('id') id: string, @Body() createRoleDto: CreateRoleDto) {
        return this.rbacService.updateRole(+id, createRoleDto);
    }

    @Delete('roles/:id')
    @ApiOperation({ summary: 'Delete a role' })
    @Permissions('roles.delete')
    deleteRole(@Param('id') id: string) {
        return this.rbacService.deleteRole(+id);
    }

    @Post('roles/:id/permissions/bulk')
    @ApiOperation({ summary: 'Add multiple permissions to a role' })
    @Permissions('roles.update')
    addPermissionsToRole(@Param('id') id: string, @Body() data: { permissionIds: number[] }) {
        return this.rbacService.addPermissionsToRole(+id, data.permissionIds);
    }

    @Delete('roles/:id/permissions/bulk')
    @ApiOperation({ summary: 'Remove multiple permissions from a role' })
    @Permissions('roles.update')
    removePermissionsFromRole(@Param('id') id: string, @Body() data: { permissionIds: number[] }) {
        return this.rbacService.removePermissionsFromRole(+id, data.permissionIds);
    }

    @Post('roles/:id/permissions/:permissionId')
    @ApiOperation({ summary: 'Add a permission to a role' })
    @Permissions('roles.update')
    addPermissionToRole(@Param('id') id: string, @Param('permissionId') permissionId: string) {
        return this.rbacService.addPermissionToRole(+id, +permissionId);
    }

    @Delete('roles/:id/permissions/:permissionId')
    @ApiOperation({ summary: 'Remove a permission from a role' })
    @Permissions('roles.update')
    removePermissionFromRole(@Param('id') id: string, @Param('permissionId') permissionId: string) {
        return this.rbacService.removePermissionFromRole(+id, +permissionId);
    }
}
