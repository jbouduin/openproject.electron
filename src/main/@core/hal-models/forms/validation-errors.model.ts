import { HalResource, HalProperty } from '@jbouduin/hal-rest-client';
import { ValidationErrorModel } from './validation-error.model';

export class ValidationErrorsModel extends HalResource {
  @HalProperty()
  activity: ValidationErrorModel;

  @HalProperty({ name: 'customField2'})
  start: ValidationErrorModel;

  @HalProperty({ name: 'customField3'})
  end: ValidationErrorModel;

  @HalProperty()
  project: ValidationErrorModel;

  @HalProperty()
  spentOn: ValidationErrorModel;

  @HalProperty()
  workPackage: ValidationErrorModel;
}
