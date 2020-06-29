import { DtoValidationError } from './response/dto-validation-error';
import { DtoBase } from './dto-base';

export interface DtoBaseForm<T extends DtoBase> {
  commit: string;
  self: string;
  validate: string;
  payload: T;
  validationErrors: Array<DtoValidationError>;
}
