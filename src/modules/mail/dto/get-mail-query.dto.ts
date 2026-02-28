import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { MailQueueStatus } from '../entities/mail-queue.entity';

export class GetMailQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search term for recipient or subject' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: MailQueueStatus, description: 'Filter by email status' })
  @IsOptional()
  @IsEnum(MailQueueStatus)
  status?: MailQueueStatus;
}
