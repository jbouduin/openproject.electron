import { HalResource, HalProperty } from "hal-rest-client";
import { SchemaAttributeModel } from "./schema-attribute.model";
import { SchemaAttributeTimeEntryActivity } from "./schema-attribute-time-entry-activity.model";
import { SchemaAttribute } from "./schema-attribute";

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

  @HalProperty()
  customField2: SchemaAttribute;

  @HalProperty()
  customField3: SchemaAttribute;
}
