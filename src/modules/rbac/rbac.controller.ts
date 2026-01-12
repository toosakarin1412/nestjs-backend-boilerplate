
import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// Will add guards later
// import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
// import { PermissionsGuard } from './guards/permissions.guard';
// import { Permissions } from './decorators/permissions.decorator';

@ApiTags('RBAC')
@Controller('rbac')
export class RbacController {
    constructor(private readonly rbacService: RbacService) { }

    @Post('permissions')
    @ApiOperation({ summary: 'Create a new permission' })
    createPermission(@Body() createPermissionDto: CreatePermissionDto) {
        return this.rbacService.createPermission(createPermissionDto);
    }

    @Get('permissions')
    @ApiOperation({ summary: 'Get all permissions' })
    findAllPermissions() {
        return this.rbacService.findAllPermissions();
    }

    @Post('roles')
    @ApiOperation({ summary: 'Create a new role' })
    createRole(@Body() createRoleDto: CreateRoleDto) {
        return this.rbacService.createRole(createRoleDto);
    }

    @Get('roles')
    @ApiOperation({ summary: 'Get all roles' })
    findAllRoles() {
        return this.rbacService.findAllRoles();
    }

    @Get('roles/:id')
    @ApiOperation({ summary: 'Get a role by ID' })
    findOneRole(@Param('id') id: string) {
        return this.rbacService.findRoleById(+id);
    }

    @Put('roles/:id')
    @ApiOperation({ summary: 'Update a role' })
    updateRole(@Param('id') id: string, @Body() createRoleDto: CreateRoleDto) {
        return this.rbacService.updateRole(+id, createRoleDto);
    }

    @Delete('roles/:id')
    @ApiOperation({ summary: 'Delete a role' })
    deleteRole(@Param('id') id: string) {
        return this.rbacService.deleteRole(+id);
    }
}
