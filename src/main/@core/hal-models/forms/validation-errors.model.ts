import { HalResource, HalProperty } from '@jbouduin/hal-rest-client';
import { CustomFieldMap } from '../custom-field-map';
import { ValidationErrorModel } from './validation-error.model';

export class ValidationErrorsModel extends HalResource {
  @HalProperty()
  activity: ValidationErrorModel;

  @HalProperty({ name: CustomFieldMap.start })
  start: ValidationErrorModel;

  @HalProperty({ name: CustomFieldMap.end })
  end: ValidationErrorModel;

  @HalProperty()
  project: ValidationErrorModel;

  @HalProperty()
  spentOn: ValidationErrorModel;

  @HalProperty()
  workPackage: ValidationErrorModel;
}
