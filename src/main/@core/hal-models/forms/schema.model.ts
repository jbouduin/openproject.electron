import { HalResource, HalProperty } from "hal-rest-client";
import { SchemaAttributeModel } from "./schema-attribute.model";
import { SchemaAttributeTimeEntryActivity } from "./schema-attribute-time-entry-activity.model";

export class SchemaModel extends HalResource {
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

  @HalProperty()
  customField2: SchemaAttributeModel;

  @HalProperty()
  customField3: SchemaAttributeModel;
}
