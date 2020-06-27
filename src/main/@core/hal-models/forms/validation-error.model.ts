import { HalResource, HalProperty } from "hal-rest-client";

export class ValidationErrorModel extends HalResource {
  @HalProperty()
  anything: string;
}
