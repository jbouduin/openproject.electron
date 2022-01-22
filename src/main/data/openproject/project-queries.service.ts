import { inject, injectable } from "inversify";
import { ILogService, IOpenprojectService } from "@core";
import { QueryGroupModel, QueryModel } from "@core/hal-models";
import SERVICETYPES from "@core/service.types";
import { BaseDataService } from "@data/base-data-service";
import { DtoBaseFilter, DtoWorkPackageStatus, DtoWorkPackageType } from "@ipc";
import { IWorkPackageStatusEntityAdapter } from "@adapters";
import ADAPTERTYPES from "@adapters/adapter.types";

export interface IProjectQueriesService {
  countWorkpackagesByTypeAndStatus(projectId: number, workpackageTypes: Array<DtoWorkPackageType>): Promise<unknown>;
}

interface ISingleQueryResult {
  workPackageType: DtoWorkPackageType;
  queryModel: QueryModel
}

export interface IWorkPackagesByTypeAndStatus {
  workPackageType: DtoWorkPackageType,
  status: DtoWorkPackageStatus,
  count: number
}

@injectable()
export class ProjectQueriesService extends BaseDataService implements IProjectQueriesService {

  //#region private properties ------------------------------------------------
  private workPackageStatusEntityAdapter: IWorkPackageStatusEntityAdapter;
  //#endregion

  //#region BasedataService abstract member implementation --------------------
  protected get entityRoot(): string { return '/projects'; };
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.WorkPackageStatusEntityAdapter) workPackageStatusEntityAdapter: IWorkPackageStatusEntityAdapter) {
    super(logService, openprojectService);
    this.workPackageStatusEntityAdapter = workPackageStatusEntityAdapter;
  }
  //#endregion

  //#region IProjectQueriesService interface members --------------------------
  public async countWorkpackagesByTypeAndStatus(projectId: number, workpackageTypes: Array<DtoWorkPackageType>): Promise<Array<IWorkPackagesByTypeAndStatus>> {
    return Promise.all(workpackageTypes.map((workpackageType: DtoWorkPackageType) => this.getSingleWorkpackageTypeStatusSummary(projectId, workpackageType)))
      .then((resources: Array<ISingleQueryResult>) => {
        const result = Array<IWorkPackagesByTypeAndStatus>();
        resources.forEach((resource: ISingleQueryResult) =>
          result.push(...resource.queryModel.results.groups.map((group: QueryGroupModel) => {
            const byTypeAndStatus: IWorkPackagesByTypeAndStatus = {
              workPackageType: resource.workPackageType,
              status: this.workPackageStatusEntityAdapter.resourceToDtoSync(group.valueLink[0]),
              count: group.count
            }
            return byTypeAndStatus;
          }))
        );
        return result;
      });
  }
  //#endregion

  //#region private helper methods --------------------------------------------
  private async getSingleWorkpackageTypeStatusSummary(projectId: number, workpackageType: DtoWorkPackageType): Promise<ISingleQueryResult> {

    const filters = new Array<unknown>();
    filters.push({
      'type': {
        'operator': '=',
        'values': [workpackageType.id]
      }
    });
    const filter: DtoBaseFilter = {
      pageSize: 0,
      offset: 0,
      filters: JSON.stringify(filters),
      groupby: 'status'
    }
    const uri = this.buildUriWithFilter(this.getQueryURL(projectId), filter);
    return this.openprojectService
      .fetch(uri, QueryModel)
      .then((queryModel: QueryModel) => {
        const result: ISingleQueryResult = {
          workPackageType: workpackageType,
          queryModel: queryModel
        };
        return result;
      });
  }

  private getQueryURL(projectId: number): string {
    return `${this.entityRoot}/${projectId}/queries/default`;
  }
  //#endregion
}