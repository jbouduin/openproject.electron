import { Injectable } from '@angular/core';
import { DataVerb, DtoBaseFilter, DtoWorkPackageList, DtoWorkPackageType, DtoWorkPackageTypeList } from '@common';
import { DataRequestFactory, IpcService } from './ipc';

@Injectable({
  providedIn: 'root'
})
export class WorkPackageService {

  //#region Private properties ------------------------------------------------
  private _types: Array<DtoWorkPackageType>;
  private dataRequestFactory: DataRequestFactory;
  private ipcService: IpcService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(dataRequestFactory: DataRequestFactory, ipcService: IpcService) {
    this.dataRequestFactory = dataRequestFactory;
    this.ipcService = ipcService;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public async loadWorkPackages(filter: DtoBaseFilter): Promise<DtoWorkPackageList> {
    const request = this.dataRequestFactory.createDataRequest(DataVerb.GET, '/work-packages', filter);
    const response = await this.ipcService.dataRequest<DtoBaseFilter, DtoWorkPackageList>(request);
    return response.data;
  }

  public async loadWorkPackageTypes(): Promise<Array<DtoWorkPackageType>> {
    if (!this._types) {
      const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/work-package-types');
      const response = await this.ipcService.untypedDataRequest<DtoWorkPackageTypeList>(request);
      this._types = response.data.items;
    }
    return this._types;
  }
  //#endregion
}
