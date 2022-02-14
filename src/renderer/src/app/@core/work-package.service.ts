import { Injectable } from '@angular/core';
import { LogService } from '@core/log.service';
import { DataVerb, DtoBaseFilter, DtoWorkPackageList, DtoWorkPackageType, DtoWorkPackageTypeList } from '@ipc';
import { DataRequestFactory, IpcService } from './ipc';

@Injectable({
  providedIn: 'root'
})
export class WorkPackageService {

  //#region Private properties ------------------------------------------------
  private _types: Array<DtoWorkPackageType>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    private dataRequestFactory: DataRequestFactory,
    private ipcService: IpcService,
    private logService: LogService) {
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public async loadWorkPackages(filter: DtoBaseFilter): Promise<DtoWorkPackageList> {
    const request = this.dataRequestFactory.createDataRequest(DataVerb.GET, '/work-packages', filter);
    const response = await this.ipcService.dataRequest<DtoBaseFilter, DtoWorkPackageList>(request);
    this.logService.verbose('total', response.data.total);
    this.logService.verbose('count', response.data.count);
    this.logService.verbose('pageSize', response.data.pageSize);
    this.logService.verbose('offset', response.data.offset);
    return response.data;
  }

  public async loadWorkPackageTypes(): Promise<Array<DtoWorkPackageType>> {
    if (!this._types) {
      const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/work-package-types');
      const response = await this.ipcService.untypedDataRequest<DtoWorkPackageTypeList>(request);
      this.logService.verbose('total', response.data.total);
      this.logService.verbose('count', response.data.count);
      this.logService.verbose('pageSize', response.data.pageSize);
      this.logService.verbose('offset', response.data.offset);
      this._types = response.data.items;
    }
    return this._types;
  }
  //#endregion
}
