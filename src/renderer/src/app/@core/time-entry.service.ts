import { Injectable } from '@angular/core';
import { DataVerb, DtoBaseFilter } from '@ipc';
import { DtoTimeEntryList } from '@ipc';
import { DataRequestFactory, IpcService } from './ipc';

@Injectable({
  providedIn: 'root'
})
export class TimeEntryService {

  // <editor-fold desc='Private properties'>
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private dataRequestFactory: DataRequestFactory,
    private ipcService: IpcService) { }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public async loadTimeEntries(filter: DtoBaseFilter): Promise<DtoTimeEntryList> {
    const request = this.dataRequestFactory.createDataRequest(DataVerb.GET, '/time-entries', filter);
    const response = await this.ipcService.dataRequest<DtoBaseFilter, DtoTimeEntryList>(request);
    return response.data;
  }

  public async deleteTimeEntry(id: number): Promise<any> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.DELETE, `/time-entries/${id}`);
    const response = await this.ipcService.untypedDataRequest<any>(request);
    return response.data;
  }

  public async updateTimeEntry(id: number): Promise<void> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.POST, `/time-entries/${id}/form`);
    const response = await this.ipcService.untypedDataRequest<any>(request);
    return response.data;
  }
  // </editor-fold>

  // <editor-fold desc='Privat methods'>
  // </editor-fold>
}
