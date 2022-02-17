import { LogLevel, LogSource } from '@common';

export interface DtoLogMessage {
  logSource: LogSource;
  logLevel: LogLevel;
  message: string;
  args?: Array<any>;
}
