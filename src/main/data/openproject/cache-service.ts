import { ILogService, IOpenprojectService } from "@core";
import SERVICETYPES from "@core/service.types";
import { RoutedRequest } from "@data";
import { BaseDataService } from "@data/base-data-service";
import { IDataRouterService } from "@data/data-router.service";
import { IRoutedDataService } from "@data/routed-data-service";
import { DataStatus, DtoDataResponse, DtoProjectList, DtoTimeEntryActivityList, DtoWorkPackageStatusList, DtoWorkPackageTypeList } from "@ipc";
import { inject } from "inversify";

export interface ISetCacheOptions {
  projects?: DtoProjectList,
  timeEntryActivities?: DtoTimeEntryActivityList,
  workPackageStatuses?: DtoWorkPackageStatusList,
  workPackageTypes?: DtoWorkPackageTypeList
}

export interface ICacheService extends IRoutedDataService {
  //#region properties --------------------------------------------------------
  readonly projects?: DtoProjectList;
  readonly timeEntryActivities?: DtoTimeEntryActivityList;
  readonly workPackageStatuses?: DtoWorkPackageStatusList;
  readonly workPackageTypes?: DtoWorkPackageTypeList;
  //#endregion

  //#region methods -----------------------------------------------------------
  setCache(values: ISetCacheOptions): void
  //#endregion
}

export class CacheService extends BaseDataService implements ICacheService {

  //#region private properties ------------------------------------------------
  private _projects?: DtoProjectList;
  private _timeEntryActivities?: DtoTimeEntryActivityList;
  private _workPackageStatuses?: DtoWorkPackageStatusList;
  private _workPackageTypes?: DtoWorkPackageTypeList;
  //#endregion

  //#region Base dataservice abstract member ----------------------------------
  protected get entityRoot(): string {
    return undefined;
  }
  //#endregion

  //#region ICachService readonly properties ----------------------------------
  public get projects(): DtoProjectList {
    return this._projects;
  }

  public get timeEntryActivities(): DtoTimeEntryActivityList {
    return this._timeEntryActivities;
  }

  public get workPackageStatuses(): DtoWorkPackageStatusList {
    return this._workPackageStatuses;
  }

  public get workPackageTypes(): DtoWorkPackageTypeList {
    return this._workPackageTypes;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService) {
    super(logService, openprojectService)
  }
  //#endregion

  //#region IDataService members ----------------------------------------------
  public setRoutes(router: IDataRouterService): void {
    router.get('/projects', this.getProjects.bind(this));
    router.get('/work-package-types', this.getWorkPackageTypes.bind(this));
  }
  //#endregion

  //#region ICacheService methods ---------------------------------------------
  public setCache(values: ISetCacheOptions): void {
    this._projects = values.projects;
    this._timeEntryActivities = values.timeEntryActivities;
    this._workPackageStatuses = values.workPackageStatuses;
    this._workPackageTypes = values.workPackageTypes;
  }
  //#endregion

  //#region GET method callbacks ----------------------------------------------
  private async getProjects(_request: RoutedRequest): Promise<DtoDataResponse<DtoProjectList>> {
    const result: DtoDataResponse<DtoProjectList> = {
      status: this._projects ? DataStatus.Ok : DataStatus.Error,
      data: this._projects
    };
    if (!this._projects) {
      result.message = 'Cache is empty. Please refresh it.'
    }
    return Promise.resolve(result);
  }

  private async getWorkPackageTypes(_request: RoutedRequest): Promise<DtoDataResponse<DtoWorkPackageTypeList>> {
    const result: DtoDataResponse<DtoWorkPackageTypeList> = {
      status: this._workPackageTypes ? DataStatus.Ok : DataStatus.Error,
      data: this._workPackageTypes
    };
    if (!this._workPackageTypes) {
      result.message = 'Cache is empty. Please refresh it.'
    }
    return Promise.resolve(result);
  }
  //#endregion
}