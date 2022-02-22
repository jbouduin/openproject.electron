import { Injectable } from '@angular/core';
import { DataVerb, DtoDataRequest, DtoUntypedDataRequest } from '@common';

import { DataRequest } from './data-request';

@Injectable({
  providedIn: 'root'
})
export class DataRequestFactory {

  // <editor-fold desc='Private properties'>
  private requestId: number;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.requestId = 0;
  }
  // </editor-fold>

  // <editor-fold desc='Pubic methods'>
  public createUntypedDataRequest(verb: DataVerb, path: string): DtoUntypedDataRequest {
    return new DataRequest(++this.requestId, verb, path, undefined);
  }

  public createDataRequest<T>(verb: DataVerb, path: string, data: T): DtoDataRequest<T> {
    return new DataRequest(++this.requestId, verb, path, data);
  }
  // </editor-fold>
}
