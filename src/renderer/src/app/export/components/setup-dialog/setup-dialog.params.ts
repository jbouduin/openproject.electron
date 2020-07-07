import { DtoSchema, DtoExportRequest } from '@ipc';

export class SetupDialogParams {
  public header: string;
  public schema: DtoSchema;
  public data: any;
  public title: Array<string>;
  public callBack: (data: DtoExportRequest) => void;

  constructor(
    header: string,
    schema: DtoSchema,
    title: Array<string>,
    data: any,
    callBack: (data: any) => void) {
    this.header = header;
    this.schema = schema;
    this.title = title;
    this.data = data;
    this.callBack = callBack;
  }
}
