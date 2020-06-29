import { HalResource, HalProperty } from "hal-rest-client";
import { ValidationErrorModel } from "./validation-error.model";

export class ValidationErrorsModel extends HalResource {
  @HalProperty()
  activity: ValidationErrorModel;

  @HalProperty()
  customField2: ValidationErrorModel;

  @HalProperty()
  customField3: ValidationErrorModel;

  @HalProperty()
  project: ValidationErrorModel;

  @HalProperty()
  spentOn: ValidationErrorModel;

  @HalProperty()
  workPackage: ValidationErrorModel;
}
