import { DataVerb, DtoUntypedDataRequest } from '@common';

export class DataRequest implements DtoUntypedDataRequest {

  // <editor-fold desc='Constructor'>
  public constructor(
    public id: number,
    public verb: DataVerb,
    public path: string,
    public data?: any) { }
  // </editor-fold>


}
