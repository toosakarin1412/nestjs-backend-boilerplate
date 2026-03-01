import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { GetAuditQueryDto } from './dto/get-audit-query.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Non-blocking log method.
   * This implements a fire-and-forget pattern so it doesn't block the request.
   */
  public log(logData: Partial<AuditLog>): void {
    this.createLog(logData).catch((err) => {
      this.logger.error('Failed to create audit log', err);
    });
  }

  private async createLog(logData: Partial<AuditLog>): Promise<void> {
    if (logData.metadata) {
      logData.metadata = this.maskSensitiveData(logData.metadata);
    }
    const auditLog = this.auditLogRepository.create(logData);
    await this.auditLogRepository.save(auditLog);
  }

  private maskSensitiveData(data: any): any {
    if (!data) return data;
    
    const sensitiveKeys = [
      'password', 
      'token', 
      'oldPassword', 
      'newPassword', 
      'accessToken', 
      'refreshToken'
    ];
    
    if (typeof data !== 'object') return data;
    
    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item));
    }

    const maskedData = { ...data };
    for (const key of Object.keys(maskedData)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive.toLowerCase()))) {
        maskedData[key] = '***REDACTED***';
      } else if (typeof maskedData[key] === 'object' && maskedData[key] !== null) {
        maskedData[key] = this.maskSensitiveData(maskedData[key]);
      }
    }
    return maskedData;
  }

  private generateDescription(action: string, metadata: any, actorEmail: string | null, entityType: string): string {
    const actor = actorEmail || 'System';
    const target = (entityType || 'record').toLowerCase();
    
    // Extract target details from metadata body or params
    const getTargetDetails = () => {
       if (!metadata) return '';
       const body = metadata.body || {};
       const params = metadata.params || {};
       
       // Common fields that could identify a target
       const identifier = body.email || body.name || body.username || body.title || body.role;
       const targetId = params.id || params.user_uuid || params.user_id || params.uuid;

       if (identifier) return ` '${identifier}'`;
       if (targetId) return ` with ID ${targetId}`;
       return '';
    };

    const details = getTargetDetails();

    const descriptions: Record<string, string> = {
      'PASSWORD_RESET': `${actor} requested a password reset${details.replace('\'', 'for \'')}`,
      'UPDATE_AVATAR': `${actor} updated avatar for ${target}${details}`,
      'ROLE_CHANGE': `${actor} changed role for ${target}${details}`,
      'LOGIN': `${actor} logged into the system`,
    };

    // Try to find an exact match
    if (descriptions[action]) {
      return descriptions[action];
    }

    // Try to generate a generic one based on the action name string
    const normalizedAction = (action || '').toLowerCase();
    if (normalizedAction.includes('create')) return `${actor} created a new ${target}${details}`;
    if (normalizedAction.includes('update') || normalizedAction.includes('edit')) return `${actor} updated ${target}${details}`;
    if (normalizedAction.includes('delete') || normalizedAction.includes('remove')) return `${actor} deleted ${target}${details}`;

    return `${actor} performed an action on ${target}${details}`;
  }

  async findAll(query: GetAuditQueryDto) {
    const { page = 1, limit = 10, search, userEmail, action, entity } = query;
    const skip = (page - 1) * limit;

    const qb = this.auditLogRepository.createQueryBuilder('auditLog')
      .leftJoinAndMapOne('auditLog.user', User, 'user', 'user.user_uuid = auditLog.userId');

    if (search) {
      qb.andWhere(
        '(auditLog.action LIKE :search OR auditLog.entity LIKE :search OR auditLog.ip_address LIKE :search OR CAST(auditLog.metadata AS TEXT) LIKE :search OR user.email LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (userEmail) {
      qb.andWhere('user.email = :userEmail', { userEmail });
    }

    if (action) {
      qb.andWhere('auditLog.action = :action', { action });
    }

    if (entity) {
      qb.andWhere('auditLog.entity = :entity', { entity });
    }

    qb.orderBy('auditLog.createdAt', 'DESC');
    qb.skip(skip).take(limit);

    const [auditLogs, total] = await qb.getManyAndCount();

    // Map the user.email back into the response as userEmail and generate description
    const data = auditLogs.map(log => {
      // We expect log.user to be populated because of leftJoinAndMapOne
      const { user, ...logData } = log as any;
      const userEmail = user ? user.email : null;
      return {
        ...logData,
        userEmail,
        description: this.generateDescription(logData.action, logData.metadata, userEmail, logData.entity),
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      metadata: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
