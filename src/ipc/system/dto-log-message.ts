import { LogLevel, LogSource } from '@common';

export interface DtoLogMessage {
  logSource: LogSource;
  logLevel: LogLevel;
  object: any;
  args?: Array<any>;
}
