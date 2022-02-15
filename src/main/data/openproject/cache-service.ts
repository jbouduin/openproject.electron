import { cache } from "@jbouduin/hal-rest-client";
import { inject } from "inversify";
import { ILogService, IOpenprojectService } from "@core";
import SERVICETYPES from "@core/service.types";
import { BaseDataService } from "@data/base-data-service";
import { IDataRouterService } from "@data/data-router.service";
import { IRoutedDataService } from "@data/routed-data-service";
import { DataStatus, DtoClientCacheEntry, DtoDataResponse, DtoProjectList, DtoResourceCacheEntry, DtoUntypedDataResponse, DtoWorkPackageStatusList, DtoWorkPackageTypeList, LogSource } from "@ipc";
import { IProjectsService } from './projects.service';
import { IWorkPackageStatusService } from './work-package-status.service';
import { IWorkPackageTypeService } from "./work-package-type.service";

export interface ICacheService extends IRoutedDataService {
  initialize(): Promise<DtoUntypedDataResponse>;
}

export class CacheService extends BaseDataService implements ICacheService {

  //#region private properties ------------------------------------------------
  private workPackageTypeService: IWorkPackageTypeService;
  private workPackageStatusService: IWorkPackageStatusService;
  private projectService: IProjectsService;
  //#endregion

  //#region Base dataservice abstract member ----------------------------------
  protected get entityRoot(): string {
    return undefined;
  }
  //#endregion


  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(SERVICETYPES.WorkPackageTypeService) workPackageTypeService: IWorkPackageTypeService,
    @inject(SERVICETYPES.WorkPackageStatusService) workPackageStatusService: IWorkPackageStatusService,
    @inject(SERVICETYPES.ProjectsService) projectService: IProjectsService) {
    super(logService, openprojectService);
    this.workPackageTypeService = workPackageTypeService;
    this.workPackageStatusService = workPackageStatusService;
    this.projectService = projectService;
  }
  //#endregion

  //#region IDataService members ----------------------------------------------
  public setRoutes(router: IDataRouterService): void {
    /* eslint-disable @typescript-eslint/no-unsafe-argument */
    router.get('/cache/contents/clients', this.getClientCacheContents.bind(this));
    router.get('/cache/contents/resources', this.getResourceCacheContents.bind(this));
    router.post('/cache/refresh', this.refreshCache.bind(this));
    router.delete('/cache/', this.clearCache.bind(this));
    /* eslint-enable @typescript-eslint/no-unsafe-argument */
  }
  //#endregion

  //#region ICacheService methods ---------------------------------------------
  public initialize(): Promise<DtoUntypedDataResponse> {
    return this.refreshCache();
  }
  //#endregion

  //#region GET method callbacks ----------------------------------------------
  private getClientCacheContents(): Promise<DtoDataResponse<Array<DtoClientCacheEntry>>> {
    const resourceCacheKeys = cache.getKeys('Client');
    const data = resourceCacheKeys.map((key: string) => {
      const entry: DtoClientCacheEntry = { cacheKey: key };
      return entry;
    });
    const result: DtoDataResponse<Array<DtoClientCacheEntry>> = {
      status: DataStatus.Ok,
      data: data
    };
    return Promise.resolve(result);
  }

  private getResourceCacheContents(): Promise<DtoDataResponse<Array<DtoResourceCacheEntry>>> {
    const resourceCacheKeys = cache.getKeys('Resource');
    const data = resourceCacheKeys.map((key: string) => {
      const entry: DtoResourceCacheEntry = { cacheKey: key, isLoaded: cache.getResource(key).isLoaded };
      return entry;
    });
    const result: DtoDataResponse<Array<DtoResourceCacheEntry>> = {
      status: DataStatus.Ok,
      data: data
    };
    return Promise.resolve(result);
  }
  //#endregion

  //#region DELETE method callback --------------------------------------------
  private clearCache(): Promise<DtoUntypedDataResponse> {
    const result: DtoUntypedDataResponse = {
      status: DataStatus.Ok
    };
    return Promise.resolve(result);
  }
  //#endregion

  //#region POST method callback -----------------------------------------------
  private refreshCache(): Promise<DtoUntypedDataResponse> {
    this.logService.verbose(LogSource.Main, 'clearing resource cache')
    cache.reset('Resource');
    this.logService.verbose(LogSource.Main, 'starting refreshcache');
    return Promise
      .all([
        this.workPackageTypeService.loadWorkPackageTypes(),
        this.workPackageStatusService.loadWorkPackageStatuses(),
        this.projectService.loadProjects()
      ])
      .then((results: [DtoWorkPackageTypeList, DtoWorkPackageStatusList, DtoProjectList]) => {
        this.logService.verbose(LogSource.Main, `loaded ${results[0].count} workpackagetypes`);
        this.logService.verbose(LogSource.Main, `loaded ${results[1].count} workpackagestatuses`);
        this.logService.verbose(LogSource.Main, `loaded ${results[2].count} projects`);
        const result: DtoUntypedDataResponse = {
          status: DataStatus.Ok
        };
        return result;
      },
        (reason: any) => {
          console.log(reason)
          const result: DtoUntypedDataResponse = {
            status: DataStatus.Error
          };
          return result;
        });
  }
  //#endregion
}