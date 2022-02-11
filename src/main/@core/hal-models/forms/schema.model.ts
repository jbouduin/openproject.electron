import { HalResource, HalProperty } from '@jbouduin/hal-rest-client';
import { SchemaAttributeModel } from './schema-attribute.model';
import { SchemaAttributeTimeEntryActivity } from './schema-attribute-time-entry-activity.model';
import { SchemaAttribute } from './schema-attribute';
import { CustomFieldMap } from '../custom-field-map';

export class SchemaModel extends HalResource {

  @HalProperty()
  id: SchemaAttribute;

  @HalProperty()
  createdAt: SchemaAttributeModel;

  @HalProperty()
  updatedAt: SchemaAttributeModel;

  @HalProperty()
  spentOn: SchemaAttributeModel;

  @HalProperty()
  hours: SchemaAttributeModel;

  @HalProperty()
  user: SchemaAttributeModel;

  @HalProperty()
  comment: SchemaAttributeModel;

  @HalProperty()
  workPackage: SchemaAttributeModel;

  @HalProperty()
  project: SchemaAttributeModel;

  @HalProperty()
  activity: SchemaAttributeTimeEntryActivity;

  @HalProperty({ name: CustomFieldMap.start })
  start: SchemaAttribute;

  @HalProperty({ name: CustomFieldMap.end })
  end: SchemaAttribute;
}
