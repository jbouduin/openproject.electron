import { DtoSchemaAttribute } from '@common';

export class SchemaAttribute implements DtoSchemaAttribute {
  type: string;
  name: string;
  required: boolean;
  hasDefault: boolean;
  writable: boolean;
  minLength: number;
  maxLength: number;
  regularExpression: string;
}
