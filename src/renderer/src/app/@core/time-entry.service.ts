import { Injectable, ɵclearResolutionOfComponentResourcesQueue } from '@angular/core';
import { DataVerb, DtoBaseFilter, DtoTimeEntryForm, DtoTimeEntry, DtoSchema } from '@ipc';
import { DtoTimeEntryList } from '@ipc';
import { DataRequestFactory, IpcService } from './ipc';
import { TimeEntrySortService } from './time-entry-sort.service';

@Injectable({
  providedIn: 'root'
})
export class TimeEntryService {

  //#region Private properties ------------------------------------------------
  private timeEntrySchema: DtoSchema;
  private timeEntrySortService: TimeEntrySortService
  private dataRequestFactory: DataRequestFactory;
  private ipcService: IpcService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    timeEntrySortService: TimeEntrySortService,
    dataRequestFactory: DataRequestFactory,
    ipcService: IpcService) {
      this.timeEntrySortService = timeEntrySortService;
      this.dataRequestFactory = dataRequestFactory;
      this.ipcService = ipcService;
    }
  //#endregion

  //#region Public methods ----------------------------------------------------
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

  public async getUpdateTimeEntryForm(id: number): Promise<DtoTimeEntryForm> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, `/time-entries/${id}/form`);
    const response = await this.ipcService.untypedDataRequest<DtoTimeEntryForm>(request);
    return response.data;
  }

  public async getCreateTimeEntryForm(): Promise<DtoTimeEntryForm> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, `/time-entries/form`);
    const response = await this.ipcService.untypedDataRequest<DtoTimeEntryForm>(request);
    return response.data;
  }

  public async getTimeEntrySchema(): Promise<DtoSchema> {
    if (!this.timeEntrySchema)  {
      const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, `/time-entries/schema`);
      const response = await this.ipcService.untypedDataRequest<DtoSchema>(request);
      this.timeEntrySchema = response.data;
    }
    return this.timeEntrySchema;
  }

  public async validateTimeEntry(timeEntryForm: DtoTimeEntryForm): Promise<DtoTimeEntryForm> {
    const request = this.dataRequestFactory.createDataRequest<DtoTimeEntryForm>(DataVerb.GET, '/time-entries/form', timeEntryForm);
    const validation = await this.ipcService.dataRequest<DtoTimeEntryForm, DtoTimeEntryForm>(request);
    return validation.data;
  }

  public async saveTimeEntry(timeEntryForm: DtoTimeEntryForm): Promise<DtoTimeEntry> {
    const request = this.dataRequestFactory.createDataRequest<DtoTimeEntryForm>(DataVerb.POST, '/time-entries/form', timeEntryForm);
    const result = await this.ipcService.dataRequest<DtoTimeEntryForm, DtoTimeEntry>(request);
    return result.data;
  }

  public async getLastTimeEntryOfTheDay(date: Date): Promise<DtoTimeEntry> {
    const filters = new Array<any>();
    filters.push(
      {
        'spent_on': {
          'operator': '=d',
          'values': [
            new Intl.DateTimeFormat('de-DE').format(date)
          ]
        }
      }
    );
    const filter: DtoBaseFilter = {
      offset: 1,
      pageSize: 500,
      filters: JSON.stringify(filters)
    };
    const request = this.dataRequestFactory.createDataRequest(DataVerb.GET, '/time-entries', filter);
    const response = await this.ipcService.dataRequest<DtoBaseFilter, DtoTimeEntryList>(request);
    // not using pop() because in async logging, it displays the shortened array
    return response.data.count > 0 ?
      this.timeEntrySortService.sortByDateAndTime(response.data.items)[response.data.count - 1] :
      undefined;
  }
  //#endregion
}
