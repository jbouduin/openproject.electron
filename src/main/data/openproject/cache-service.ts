import { ILogService, IOpenprojectService } from "@core";
import SERVICETYPES from "@core/service.types";
import { BaseDataService } from "@data/base-data-service";
import { IDataRouterService } from "@data/data-router.service";
import { IRoutedDataService } from "@data/routed-data-service";
import { DataStatus, DtoClientCacheEntry, DtoDataResponse, DtoProjectList, DtoResourceCacheEntry, DtoTimeEntryActivityList, DtoWorkPackageStatusList, DtoWorkPackageType, DtoWorkPackageTypeList } from "@ipc";
import { cache } from "@jbouduin/hal-rest-client";
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
  getWorkPackageTypeByName(name: string): DtoWorkPackageType;
  setCache(values: ISetCacheOptions): void;
  //#endregion
}

export class CacheService extends BaseDataService implements ICacheService {

  //#region private properties ------------------------------------------------
  // TODO re-implement cache (including refresh):
  // no need to store them, they are in the halcache already
  // this also means that this service could be reduced to real cache handling and the methods go
  // back to the particular services
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
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    router.get('/projects', this.getProjects.bind(this));
    router.get('/work-package-types', this.getWorkPackageTypes.bind(this));
    router.get('/cache/contents/clients', this.getClientCacheContents.bind(this));
    router.get('/cache/contents/resources', this.getResourceCacheContents.bind(this));
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
  }
  //#endregion

  //#region ICacheService methods ---------------------------------------------
  getWorkPackageTypeByName(name: string): DtoWorkPackageType {
    return this._workPackageTypes ?
      this._workPackageTypes.items.find((type: DtoWorkPackageType) => type.name === name) :
      undefined;
  }

  public setCache(values: ISetCacheOptions): void {
    this._projects = values.projects;
    this._timeEntryActivities = values.timeEntryActivities;
    this._workPackageStatuses = values.workPackageStatuses;
    this._workPackageTypes = values.workPackageTypes;
  }
  //#endregion

  //#region GET method callbacks ----------------------------------------------
  private getClientCacheContents(): DtoDataResponse<Array<DtoClientCacheEntry>> {
    const resourceCacheKeys = cache.getKeys('Client');
    const data = resourceCacheKeys.map((key: string) => {
      const entry: DtoClientCacheEntry = { cacheKey: key };
      return entry;
    });
    const result: DtoDataResponse<Array<DtoClientCacheEntry>> = {
      status: DataStatus.Ok,
      data: data
    };
    return result;
  }

  private getResourceCacheContents(): DtoDataResponse<Array<DtoResourceCacheEntry>> {
    const resourceCacheKeys = cache.getKeys('Resource');
    const data = resourceCacheKeys.map((key: string) => {
      const entry: DtoResourceCacheEntry = { cacheKey: key, isLoaded: cache.getResource(key).isLoaded };
      return entry;
    });
    const result: DtoDataResponse<Array<DtoResourceCacheEntry>> = {
      status: DataStatus.Ok,
      data: data
    };
    return result;
  }

  // private async getProjects(_request: RoutedRequest): Promise<DtoDataResponse<DtoProjectList>> {
  private async getProjects(): Promise<DtoDataResponse<DtoProjectList>> {
    const result: DtoDataResponse<DtoProjectList> = {
      status: this._projects ? DataStatus.Ok : DataStatus.Error,
      data: this._projects
    };
    if (!this._projects) {
      result.message = 'Cache is empty. Please refresh it.'
    }
    return Promise.resolve(result);
  }

  private async getWorkPackageTypes(): Promise<DtoDataResponse<DtoWorkPackageTypeList>> {
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