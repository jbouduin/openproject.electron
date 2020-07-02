import { DtoSchema } from '@ipc';

export class SetupDialogParams {
  public header: string;
  public schema: DtoSchema;
  public data: any;
  public callBack: (data: any) => void;

  constructor(
    header: string,
    schema: DtoSchema,
    data: any,
    callBack: (data: any) => void) {
    this.header = header;
    this.schema = schema;
    this.data = data;
    this.callBack = callBack;
  }
}
