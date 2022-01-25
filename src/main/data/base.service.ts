import { injectable } from 'inversify';
import 'reflect-metadata';
import { ILogService } from '@core';

@injectable()
export abstract class BaseService {

  //#region Protected properties ----------------------------------------------
  protected logService: ILogService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(logService: ILogService) {
    this.logService = logService;;
  }
  //#endregion
}
