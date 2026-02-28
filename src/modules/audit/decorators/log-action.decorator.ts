import { SetMetadata } from '@nestjs/common';

export const LOG_ACTION_KEY = 'log_action';

export interface LogActionMetadata {
  action: string;
  entity: string;
}

export const LogAction = (action: string, entity: string) => 
  SetMetadata(LOG_ACTION_KEY, { action, entity } as LogActionMetadata);
