import { Inject, Injectable } from '@angular/core';
import * as Collections from 'typescript-collections';

import { DataVerb, DtoBaseFilter, LogSource } from '@ipc';
import { DtoProjectList, DtoProject, DtoTimeEntryList, DtoTimeEntry } from '@ipc';
import { DataRequestFactory, IpcService } from './ipc';

import { LogService } from '@core/log.service';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  // <editor-fold desc='Private properties'>
  private _projects: Collections.Dictionary<number, DtoProject>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private dataRequestFactory: DataRequestFactory,
    private ipcService: IpcService,
    private logService: LogService) {
    this._projects = new Collections.Dictionary<number, DtoProject>();
  }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
  public projects(): Promise<Array<DtoProject>> {
    if (this._projects.size() === 0) {
      return this.fetchProjects().then(projects => {
        projects.forEach(project => this._projects.setValue(project.id, project));
        return projects;
      });
    }
    return Promise.resolve(this._projects.values());
  }

  public refresh(): void {
    this.fetchProjects().then(projects => {
      projects.forEach(project => this._projects.setValue(project.id, project))
    });
  }

  public timeEntries(): Promise<Array<DtoTimeEntry>> {
    // supported sorts:
    // id: Sort by primary key
    // hours: Sort by logged hours
    // spent_on: Sort by spent on date
    // created_on: Sort by time entry creation datetime
    const start = new Date(2020, 4, 1);
    const end = new Date(2020, 4, 31);
    const filters = [
      {
        'spent_on': {
          'operator': '<>d',
          'values': [
            new Intl.DateTimeFormat('de-DE').format(start),
            new Intl.DateTimeFormat('de-DE').format(end)
          ]
       }
      }
    ];
    const sortBy = [['spent_on', 'asc']];
    const filter: DtoBaseFilter = {
      offset: 1,
      pageSize: 50,
      sortBy: JSON.stringify(sortBy),
      filters: JSON.stringify(filters)
    };

    const request = this.dataRequestFactory.createDataRequest(DataVerb.GET, '/time-entries', filter);
    return this.ipcService
     .dataRequest<DtoBaseFilter, DtoTimeEntryList>(request)
     .then(response => {
       this.logService.verbose('total', response.data.total);
       this.logService.verbose('count', response.data.count);
       this.logService.verbose('pageSize', response.data.pageSize);
       this.logService.verbose('offset', response.data.offset);
       return response.data.items;
     });
  }
  // </editor-fold>

  // <editor-fold desc='Privat methods'>
  private fetchProjects(): Promise<Array<DtoProject>> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/projects');

    return this.ipcService
      .untypedDataRequest<DtoProjectList>(request)
      .then(response => {
        this.logService.verbose('total', response.data.total);
        this.logService.verbose('count', response.data.count);
        this.logService.verbose('pageSize', response.data.pageSize);
        this.logService.verbose('offset', response.data.offset);
        return response.data.items;
      });
  }
  // </editor-fold>
}
