import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { WorkPackageStatusEntityModel, WorkPackageStatusCollectionModel } from '@core/hal-models';
import { DtoWorkPackageStatusList, DtoWorkPackageStatus } from '@ipc';
import { IBaseCollectionAdapter, BaseCollectionAdapter } from '../base-collection.adapter';
import { IWorkPackageStatusEntityAdapter } from '../entities/work-package-status-entity.adapter';
import { BaseList } from '../base-list';
import { ILogService } from '@core';
import SERVICETYPES from '@core/service.types';

// <editor-fold desc='Helper class'>
class WorkPackageStatusList extends BaseList<DtoWorkPackageStatus> implements DtoWorkPackageStatusList { }
// </editor-fold>

export type IWorkPackageStatusCollectionAdapter =
  IBaseCollectionAdapter<WorkPackageStatusEntityModel, DtoWorkPackageStatusList, DtoWorkPackageStatus>;

@injectable()
export class WorkPackageStatusCollectionAdapter
  extends BaseCollectionAdapter<WorkPackageStatusEntityModel, DtoWorkPackageStatusList, DtoWorkPackageStatus>
  implements IWorkPackageStatusCollectionAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor(@inject(SERVICETYPES.LogService) logService: ILogService) {
    super(logService);
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoWorkPackageStatusList {
    return new WorkPackageStatusList();
  }
  // </editor-fold>

  // <editor-fold desc='IWorkPackageListAdapter interface methods'>
  public resourceToDto(entityAdapter: IWorkPackageStatusEntityAdapter, collection: WorkPackageStatusCollectionModel): Promise<DtoWorkPackageStatusList> {
    return super.resourceToDto(entityAdapter, collection);
  }
  // </editor-fold>
}
