import { Injectable } from '@angular/core';
import { LogService } from '@core/log.service';
import { DataVerb, DtoBaseFilter, DtoWorkPackageList } from '@ipc';
import { DataRequestFactory, IpcService } from './ipc';

@Injectable({
  providedIn: 'root'
})
export class WorkPackageService {

  // <editor-fold desc='Private properties'>
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private dataRequestFactory: DataRequestFactory,
    private ipcService: IpcService,
    private logService: LogService) {
  }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public async loadWorkPackages(filter: DtoBaseFilter): Promise<DtoWorkPackageList> {
    const request = this.dataRequestFactory.createDataRequest(DataVerb.GET, '/work-packages', filter);
    const response = await this.ipcService.dataRequest<DtoBaseFilter, DtoWorkPackageList>(request);
    this.logService.verbose('total', response.data.total);
    this.logService.verbose('count', response.data.count);
    this.logService.verbose('pageSize', response.data.pageSize);
    this.logService.verbose('offset', response.data.offset);
    return response.data;
  }
  // </editor-fold>

  // <editor-fold desc='Privat methods'>
  // </editor-fold>
}
