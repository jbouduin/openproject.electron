import { injectable } from 'inversify';
import 'reflect-metadata';
import { WorkPackageStatusEntityModel } from '@core/hal-models';
import { DtoWorkPackageStatus } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { Base } from '../base';

// <editor-fold desc='Helper class'>
class WorkPackageStatus extends Base implements DtoWorkPackageStatus {
  public name: string;
  public isCloses: boolean;
  public color: string;
  public isDefault: boolean;
  public isReadonly: boolean;
  public defaultDoneRatio: number;
  public position: number;

  public constructor() {
    super();
  }
}
// </editor-fold>

export interface IWorkPackageStatusEntityAdapter extends IBaseEntityAdapter<WorkPackageStatusEntityModel, DtoWorkPackageStatus> { }

@injectable()
export class WorkPackageStatusEntityAdapter
  extends BaseEntityAdapter<WorkPackageStatusEntityModel, DtoWorkPackageStatus>
  implements IWorkPackageStatusEntityAdapter {

  // <editor-fold desc='Private properties'>
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoWorkPackageStatus {
    return new WorkPackageStatus();
  }
  // </editor-fold>

  // <editor-fold desc='IWorkPackageEntityAdapter interface methods'>
  public async resourceToDto(entityModel: WorkPackageStatusEntityModel): Promise<DtoWorkPackageStatus> {
    const result = await super.resourceToDto(entityModel);

    result.name = entityModel.name;
    result.isCloses = entityModel.isCloses;
    result.color = entityModel.color;
    result.isDefault = entityModel.isDefault;
    result.isReadonly = entityModel.isReadonly;
    result.defaultDoneRatio = entityModel.defaultDoneRatio;
    result.position = entityModel.position;

    return result;
  }
  // </editor-fold>
}
