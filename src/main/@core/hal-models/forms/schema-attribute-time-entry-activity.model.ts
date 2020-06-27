import { HalProperty } from "hal-rest-client";
import { SchemaAttributeModel } from "./schema-attribute.model";
import { TimeEntryActivityEntityModel } from "..";

export class SchemaAttributeTimeEntryActivity extends SchemaAttributeModel  {

  @HalProperty(TimeEntryActivityEntityModel)
  allowedValues: Array<TimeEntryActivityEntityModel>;
}
