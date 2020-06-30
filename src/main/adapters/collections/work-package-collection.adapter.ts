import { injectable } from 'inversify';
import 'reflect-metadata';
import { WorkPackageEntityModel, WorkPackageCollectionModel } from '@core/hal-models';
import { DtoWorkPackageList, DtoWorkPackage } from '@ipc';
import { IBaseCollectionAdapter, BaseCollectionAdapter } from '../base-collection.adapter';
import { IWorkPackageEntityAdapter } from '../entities/work-package-entity.adapter';
import { BaseList } from '../base-list';

// <editor-fold desc='Helper class'>
class WorkPackageList extends BaseList<DtoWorkPackage> implements DtoWorkPackageList { }
// </editor-fold>

export interface IWorkPackageCollectionAdapter extends IBaseCollectionAdapter<WorkPackageEntityModel, DtoWorkPackageList, DtoWorkPackage>{ }

@injectable()
export class WorkPackageCollectionAdapter
  extends BaseCollectionAdapter<WorkPackageEntityModel, DtoWorkPackageList, DtoWorkPackage>
  implements IWorkPackageCollectionAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoWorkPackageList {
    return new WorkPackageList();
  }
  // </editor-fold>

  // <editor-fold desc='IWorkPackageListAdapter interface methods'>
  public resourceToDto(entityAdapter: IWorkPackageEntityAdapter, collection: WorkPackageCollectionModel): Promise<DtoWorkPackageList> {
    return super.resourceToDto(entityAdapter, collection);
  }
  // </editor-fold>
}
