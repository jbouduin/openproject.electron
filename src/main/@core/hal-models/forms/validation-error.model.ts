import { HalResource, HalProperty } from "hal-rest-client";
import { ValidationErrorDetailModel } from "./validation-error-detail.model";


export class ValidationErrorModel extends HalResource {
  @HalProperty()
  errorIdentifier: string;

  @HalProperty()
  message: string;

  @HalProperty()
  details: ValidationErrorDetailModel;

  @HalProperty(ValidationErrorModel)
  errors: Array<ValidationErrorModel>;
}
