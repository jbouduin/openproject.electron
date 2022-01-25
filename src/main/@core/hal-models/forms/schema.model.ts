import { HalResource, HalProperty } from '@jbouduin/hal-rest-client';
import { SchemaAttributeModel } from './schema-attribute.model';
import { SchemaAttributeTimeEntryActivity } from './schema-attribute-time-entry-activity.model';
import { SchemaAttribute } from './schema-attribute';

export class SchemaModel extends HalResource {

  @HalProperty()
  id: SchemaAttribute;

  @HalProperty()
  createdAt: SchemaAttribute;

  @HalProperty()
  updatedAt: SchemaAttribute;

  @HalProperty()
  spentOn: SchemaAttribute;

  @HalProperty()
  hours: SchemaAttribute;

  @HalProperty()
  user: SchemaAttribute;

  @HalProperty()
  comment: SchemaAttribute;

  @HalProperty()
  workPackage: SchemaAttributeModel;

  @HalProperty()
  project: SchemaAttributeModel;

  @HalProperty()
  activity: SchemaAttributeTimeEntryActivity;

  @HalProperty({name: 'customField2'})
  start: SchemaAttribute;

  @HalProperty({name: 'customField3'})
  end: SchemaAttribute;
}
