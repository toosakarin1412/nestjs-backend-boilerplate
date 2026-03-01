import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { GetAuditQueryDto } from './dto/get-audit-query.dto';
import { JwtGuard } from '../auth/guard/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { Permissions } from '../rbac/decorators/permissions.decorator';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@Controller('audit')
@UseGuards(JwtGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Get all audit logs with pagination and search' })
  @ApiResponse({ status: 200, description: 'List of audit logs' })
  @Permissions('audit.read')
  findAll(@Query() query: GetAuditQueryDto) {
    return this.auditService.findAll(query);
  }
}
