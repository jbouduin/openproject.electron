import { HalResource, HalProperty } from '@jbouduin/hal-rest-client';
import { ValidationErrorDetailModel } from './validation-error-detail.model';

export class ValidationErrorModel extends HalResource {
  @HalProperty()
  errorIdentifier: string;

  @HalProperty()
  message: string;

  @HalProperty()
  details: ValidationErrorDetailModel;

  @HalProperty({ resourceType: ValidationErrorModel })
  errors: Array<ValidationErrorModel>;
}
