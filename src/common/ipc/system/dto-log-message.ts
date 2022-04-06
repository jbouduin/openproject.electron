import { LogLevel } from '../../types/log-level';
import { LogSource } from '../../types/log-source';

export interface DtoLogMessage {
  logSource: LogSource;
  logLevel: LogLevel;
  message: string;
  args?: Array<any>;
}
