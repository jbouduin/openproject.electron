import { Injectable } from '@angular/core';
import { DataStatus, DtoDataRequest, DtoDataResponse, DtoUntypedDataRequest } from '@ipc';
import { dateTimeReviver } from '@common';

import { LogService } from '../log.service';

@Injectable({
  providedIn: 'root'
})
export class IpcService {

  // <editor-fold desc='Constructor & C°'>
  public constructor(private logService: LogService) { }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public openDevTools() {
    window.api.electronIpcSend('dev-tools');
  }

  public untypedDataRequest<T>(request: DtoUntypedDataRequest): Promise<DtoDataResponse<T>> {
    return this.dataRequest<any, T>(request);
  }

  public dataRequest<T,U>(request: DtoDataRequest<T>): Promise<DtoDataResponse<U>> {
    return new Promise((resolve, reject) => {
      window.api.electronIpcOnce(`data-${request.id}`, (_event, arg) => {
        try {
          const result: DtoDataResponse<U> = JSON.parse(arg, dateTimeReviver);
          this.logService.debug(`<= ${request.verb} ${request.path}: ${result.status}`, arg);
          if (result.status < DataStatus.BadRequest) {
            resolve(result);
          } else {
            reject(result);
          }
        } catch (error) {
          const errorResult: DtoDataResponse<U> = {
            status: DataStatus.RendererError,
            message: `${error.name}: ${error.message}`
          }
          reject(errorResult);
        }
      });
      window.api.electronIpcSend('data', JSON.stringify(request));
    });
  }
  // </editor-fold>
}
