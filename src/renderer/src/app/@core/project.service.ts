import { Injectable } from '@angular/core';
import { LogService } from '@core/log.service';
import { DataVerb } from '@ipc';
import { DtoProjectList, DtoProject } from '@ipc';
import { DataRequestFactory, IpcService } from './ipc';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  //#region Private properties
  private _projects: Map<number, DtoProject>;
  //#endregion

  //#region Constructor & C°
  public constructor(
    private dataRequestFactory: DataRequestFactory,
    private ipcService: IpcService,
    private logService: LogService) {
      this._projects = new Map<number, DtoProject>();
    }
  //#endregion

  //#region Public methods
  public async getProjects(): Promise<Map<number, DtoProject>> {
    if (this._projects.size == 0) {
      const projects = await this.fetchProjects();
      projects.forEach(project => this._projects.set(project.id, project));
      return this._projects;
    }
    return Promise.resolve(this._projects);
  }

  public refresh(): void {

    this.fetchProjects().then(projects => {
      this._projects.clear();
      projects.forEach(project => this._projects[project.id] = project);
    });
  }
  //#endregion

  //#region Privat methods
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
  //#endregion
}
