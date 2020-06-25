import { Injectable } from '@angular/core';
import * as Collections from 'typescript-collections';

import { DataVerb, DtoBaseFilter } from '@ipc';
import { DtoProjectList, DtoProject, DtoTimeEntryList } from '@ipc';
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
  public async projects(): Promise<Array<DtoProject>> {
    if (this._projects.size() === 0) {
      const projects = await this.fetchProjects();
      projects.forEach(project => this._projects.setValue(project.id, project));
      return projects;
    }
    return Promise.resolve(this._projects.values());
  }

  public refresh(): void {
    this.fetchProjects().then(projects => {
      projects.forEach(project => this._projects.setValue(project.id, project));
    });
  }

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
