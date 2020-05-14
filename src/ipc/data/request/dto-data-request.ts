import { DataVerb } from './data-verb';

export interface DtoDataRequest<T> {
  verb: DataVerb,
  path: string,
  data?: T
}
