import { HalResource, HalProperty } from "hal-rest-client";

export class SchemaAttributeModel extends HalResource {
  @HalProperty()
  type: string;

  @HalProperty()
  name: string;

  @HalProperty()
  required: boolean;

  @HalProperty()
  hasDefault: boolean;

  @HalProperty()
  writable: boolean;

  @HalProperty()
  minLength: number;

  @HalProperty()
  maxLength: number;

  @HalProperty()
  regularExpression: string;
}
