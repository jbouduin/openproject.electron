import { HalResource, HalProperty } from '@jbouduin/hal-rest-client';

export class ValidationErrorDetailModel extends HalResource {
  @HalProperty()
  attribute: string;
}
