import { injectable } from 'inversify';
import 'reflect-metadata';
import { WorkPackageTypeEntityModel, WorkPackageTypeCollectionModel } from '@core/hal-models';
import { DtoWorkPackageTypeList, DtoWorkPackageType } from '@ipc';
import { IBaseCollectionAdapter, BaseCollectionAdapter } from '../base-collection.adapter';
import { IWorkPackageTypeEntityAdapter } from '../entities/work-package-type-entity.adapter';
import { BaseList } from '../base-list';

// <editor-fold desc='Helper class'>
class WorkPackageTypeList extends BaseList<DtoWorkPackageType> implements DtoWorkPackageTypeList { }
// </editor-fold>

export interface IWorkPackageTypeCollectionAdapter
  extends IBaseCollectionAdapter<WorkPackageTypeEntityModel, DtoWorkPackageTypeList, DtoWorkPackageType>{ }

@injectable()
export class WorkPackageTypeCollectionAdapter
  extends BaseCollectionAdapter<WorkPackageTypeEntityModel, DtoWorkPackageTypeList, DtoWorkPackageType>
  implements IWorkPackageTypeCollectionAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoWorkPackageTypeList {
    return new WorkPackageTypeList();
  }
  // </editor-fold>

  // <editor-fold desc='IWorkPackageListAdapter interface methods'>
  public resourceToDto(entityAdapter: IWorkPackageTypeEntityAdapter, collection: WorkPackageTypeCollectionModel): Promise<DtoWorkPackageTypeList> {
    return super.resourceToDto(entityAdapter, collection);
  }
  // </editor-fold>
}
