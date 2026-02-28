import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum MailQueueStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
}

@Entity('mail_queue')
export class MailQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  recipient: string;

  @Column()
  subject: string;

  @Column()
  template_id: string;

  @Column({ type: 'json' })
  payload: any;

  @Column({
    type: 'enum',
    enum: MailQueueStatus,
    default: MailQueueStatus.PENDING,
  })
  status: MailQueueStatus;

  @Column({ default: 0 })
  attempts: number;

  @Column({ default: 0 })
  priority: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  available_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
