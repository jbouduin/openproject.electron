import { LogLevel} from '../../types/log-level';
import { LogSource } from '../../types/log-source';

export interface DtoLogLevelConfiguration {
  logSource: LogSource;
  logLevel: LogLevel;
}

export interface DtoLogConfiguration {
  levels: Array<DtoLogLevelConfiguration>;
}