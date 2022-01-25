import { HalProperty } from '@jbouduin/hal-rest-client';
import { SchemaAttributeModel } from './schema-attribute.model';
import { TimeEntryActivityEntityModel } from '..';

export class SchemaAttributeTimeEntryActivity extends SchemaAttributeModel  {

  @HalProperty({ resourceType: TimeEntryActivityEntityModel})
  allowedValues: Array<TimeEntryActivityEntityModel>;
}
