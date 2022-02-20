import { LogSource, LogLevel} from '../../../common';

export interface DtoLogLevelConfiguration {
  logSource: LogSource;
  logLevel: LogLevel;
}

export interface DtoLogConfiguration {
  levels: Array<DtoLogLevelConfiguration>;
}