import { DtoSchema, DtoExportRequest } from '@ipc';

export class SetupDialogParams {
  public header: string;
  public schema: DtoSchema;
  public data: any;
  public title: Array<string>;
  public approvalName?: string;
  public approvalLocation?: string;

  public callBack: (data: DtoExportRequest<any>) => void;

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
