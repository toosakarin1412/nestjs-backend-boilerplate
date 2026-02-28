import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
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
}
