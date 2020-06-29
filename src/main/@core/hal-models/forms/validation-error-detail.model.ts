import { HalResource, HalProperty } from "hal-rest-client";

export class ValidationErrorDetailModel extends HalResource {
  @HalProperty()
  attribute: string;
}
