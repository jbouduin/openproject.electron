import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { IWorkPackageStatusEntityAdapter, IWorkPackageStatusCollectionAdapter } from '@adapters';
import { ILogService, IOpenprojectService } from '@core';
import { WorkPackageStatusCollectionModel } from '@core/hal-models';
import { BaseDataService } from '@data/base-data-service';
import { DtoWorkPackageStatusList } from '@common';

import ADAPTERTYPES from '@adapters/adapter.types';
import SERVICETYPES from '@core/service.types';

export interface IWorkPackageStatusService {
  loadWorkPackageStatuses(): Promise<DtoWorkPackageStatusList>;
}

@injectable()
export class WorkPackageStatusService extends BaseDataService implements IWorkPackageStatusService {

  //#region private properties ------------------------------------------------
  private workPackageStatusEntityAdapter: IWorkPackageStatusEntityAdapter;
  private workPackageStatusCollectionAdapter: IWorkPackageStatusCollectionAdapter;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.WorkPackageStatusCollectionAdapter) workPackageStatusCollectionAdapter: IWorkPackageStatusCollectionAdapter,
    @inject(ADAPTERTYPES.WorkPackageStatusEntityAdapter) workPackageStatusEntityAdapter: IWorkPackageStatusEntityAdapter) {
    super(logService, openprojectService);
    this.workPackageStatusCollectionAdapter = workPackageStatusCollectionAdapter;
    this.workPackageStatusEntityAdapter = workPackageStatusEntityAdapter;
  }
  //#endregion

  //#region Protected abstract getters implementation -------------------------
  protected get entityRoot(): string { return '/statuses'; }
  //#endregion

  //#region IWorkPackageStatusService interface method ------------------------
  public async loadWorkPackageStatuses(): Promise<DtoWorkPackageStatusList> {
    return this
      .getCollectionModelByUnfilteredUri(
        true,
        this.entityRoot,
        WorkPackageStatusCollectionModel,
        false
      )
      .then((collection: WorkPackageStatusCollectionModel) =>
        this.workPackageStatusCollectionAdapter.resourceToDto(this.workPackageStatusEntityAdapter, collection)
      );
  }
  //#endregion
}
