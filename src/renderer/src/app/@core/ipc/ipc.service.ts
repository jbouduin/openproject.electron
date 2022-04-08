import { Injectable } from '@angular/core';
import { DataStatus, DtoDataRequest, DtoDataResponse, DtoUntypedDataRequest } from '@common';
import { LogService } from '../log.service';

@Injectable({
  providedIn: 'root'
})
export class IpcService {

  //#region private properties ------------------------------------------------
  private logService: LogService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(logService: LogService) {
    this.logService = logService;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public openDevTools() {
    window.api.electronIpcSend('dev-tools');
  }

  public untypedDataRequest<T>(request: DtoUntypedDataRequest): Promise<DtoDataResponse<T>> {
    return this.dataRequest<any, T>(request);
  }

  public dataRequest<T, U>(request: DtoDataRequest<T>): Promise<DtoDataResponse<U>> {
    return new Promise((resolve, reject) => {
      window.api.electronIpcOnce(`data-${request.id}`, (_event, arg: DtoDataResponse<U>) => {
        try {
          this.logService.debug(
            `<= ${request.verb} ${request.path}: ${arg.status} ${arg.message ? '(' + arg.message + ')' : ''}`, arg.data);
          if (arg.status < DataStatus.BadRequest) {
            resolve(arg);
          } else {
            reject(arg);
          }
        } catch (error) {
          const errorResult: DtoDataResponse<U> = {
            status: DataStatus.RendererError,
            message: `${error.name}: ${error.message}`
          }
          reject(errorResult);
        }
      });
      window.api.electronIpcSend('data', request);
    });
  }
  // </editor-fold>
}
