import { injectable } from 'inversify';
import 'reflect-metadata';

import { SchemaModel, SchemaAttributeModel } from '@core/hal-models';
import { DtoSchema, DtoSchemaAttribute } from '@common';

export interface ISchemaAdapter {
  resourceToDto(schema: SchemaModel): DtoSchema;
}

@injectable()
export class SchemaAdapter implements ISchemaAdapter {

  // <editor-fold desc='ISchemaAdapter interface methods'>
  public resourceToDto(schema: SchemaModel): DtoSchema {
    const attributes = new Array<DtoSchemaAttribute>();

    attributes.push(schema.id);
    attributes.push(schema.createdAt);
    attributes.push(schema.updatedAt);
    attributes.push(schema.spentOn);
    attributes.push(schema.hours);
    attributes.push(schema.user);
    attributes.push(schema.comment);
    attributes.push(this.schemaAttributeModelToDto(schema.workPackage));
    attributes.push(this.schemaAttributeModelToDto(schema.project));
    attributes.push(this.schemaAttributeModelToDto(schema.activity));
    attributes.push(schema.start);
    attributes.push(schema.end);

    const result: DtoSchema = {
      attributes
    };

    return result;
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
  private schemaAttributeModelToDto(model: SchemaAttributeModel) {
    const result: DtoSchemaAttribute = {
      type: model.type,
      name: model.name,
      required: model.required,
      hasDefault: model.hasDefault,
      writable: model.writable,
      minLength: model.minLength,
      maxLength: model.maxLength,
      regularExpression: model.regularExpression
    };
    return result;
  }
  // </editor-fold>
}
