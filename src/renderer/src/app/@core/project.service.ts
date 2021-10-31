import { Injectable } from '@angular/core';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';
import { LogService } from '@core/log.service';
import { DataVerb } from '@ipc';
import { DtoProjectList, DtoProject } from '@ipc';
import { DataRequestFactory, IpcService } from './ipc';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  // <editor-fold desc='Private properties'>
  private _projects: Dictionary<number, DtoProject>;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private dataRequestFactory: DataRequestFactory,
    private ipcService: IpcService,
    private logService: LogService) {
    this._projects = new Dictionary<number, DtoProject>();
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
  // </editor-fold>

  // <editor-fold desc='Privat methods'>
  private async fetchProjects(): Promise<Array<DtoProject>> {
    const request = this.dataRequestFactory.createUntypedDataRequest(DataVerb.GET, '/projects');

    const response = await this.ipcService
      .untypedDataRequest<DtoProjectList>(request);
    this.logService.verbose('total', response.data.total);
    this.logService.verbose('count', response.data.count);
    this.logService.verbose('pageSize', response.data.pageSize);
    this.logService.verbose('offset', response.data.offset);
    return response.data.items;
  }
  // </editor-fold>
}
