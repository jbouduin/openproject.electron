import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ILogService, IOpenprojectService } from '@core';
import SERVICETYPES from '@core/service.types';
import ADAPTERTYPES from '@adapters/adapter.types';
import { IWorkPackageTypeEntityAdapter, IWorkPackageTypeCollectionAdapter } from '@adapters';
import { DtoWorkPackageTypeList } from '@ipc';
import { WorkPackageTypeCollectionModel } from '@core/hal-models';
import { BaseService } from '@data/base.service';

export interface IWorkPackageTypeService {
  getWorkPackageTypes(): Promise<DtoWorkPackageTypeList>;
}

@injectable()
export class WorkPackageTypeService extends BaseService implements IWorkPackageTypeService {

  //#region private properties ------------------------------------------------
  private openprojectService: IOpenprojectService;
  private workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter;
  private workPackageTypeCollectionAdapter: IWorkPackageTypeCollectionAdapter;
  //#endregion

  // <editor-fold desc='Protected abstract getters implementation'>
  protected get entityRoot(): string { return '/types'; };
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(SERVICETYPES.OpenprojectService) openprojectService: IOpenprojectService,
    @inject(ADAPTERTYPES.WorkPackageTypeCollectionAdapter) workPackageTypeCollectionAdapter: IWorkPackageTypeCollectionAdapter,
    @inject(ADAPTERTYPES.WorkPackageTypeEntityAdapter) workPackageTypeEntityAdapter: IWorkPackageTypeEntityAdapter) {
    super(logService);
    this.openprojectService = openprojectService;
    this.workPackageTypeCollectionAdapter = workPackageTypeCollectionAdapter;
    this.workPackageTypeEntityAdapter = workPackageTypeEntityAdapter;
  }
  // </editor-fold>

  //#region IWorkPackageTypeService interface method --------------------------
  public async getWorkPackageTypes(): Promise<DtoWorkPackageTypeList> {
    return this.openprojectService
      .fetch(this.entityRoot, WorkPackageTypeCollectionModel)
      .then((collection: WorkPackageTypeCollectionModel) =>
        this.workPackageTypeCollectionAdapter.resourceToDto(this.workPackageTypeEntityAdapter, collection)
      );
  }
  //#endregion

}
