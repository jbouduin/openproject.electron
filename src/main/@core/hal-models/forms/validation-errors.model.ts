import { HalResource, HalProperty } from "hal-rest-client";
import { ValidationErrorModel } from "./validation-error.model";

export class ValidationErrorsModel extends HalResource {
  @HalProperty()
  activity: ValidationErrorModel;

  @HalProperty('customField2')
  start: ValidationErrorModel;

  @HalProperty('customField3')
  end: ValidationErrorModel;

  @HalProperty()
  project: ValidationErrorModel;

  @HalProperty()
  spentOn: ValidationErrorModel;

  @HalProperty()
  workPackage: ValidationErrorModel;
}
