import { LogLevel } from './log-level';
import { LogSource } from './log-source';

export interface DtoLogMessage {
  logSource: LogSource;
  logLevel: LogLevel;
  object: any;
  args?: Array<any>;
}
