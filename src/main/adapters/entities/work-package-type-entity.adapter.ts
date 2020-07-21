import { injectable } from 'inversify';
import 'reflect-metadata';
import { WorkPackageTypeEntityModel } from '@core/hal-models';
import { DtoWorkPackageType } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { Base } from '../base';

// <editor-fold desc='Helper class'>
class WorkPackageType extends Base implements DtoWorkPackageType {
  public name: string;
  public color: string;
  public position: number;
  public isDefault: boolean;
  public isMilestone: boolean;

  public constructor() {
    super();
  }
}
// </editor-fold>

export interface IWorkPackageTypeEntityAdapter extends IBaseEntityAdapter<WorkPackageTypeEntityModel, DtoWorkPackageType> { }

@injectable()
export class WorkPackageTypeEntityAdapter
  extends BaseEntityAdapter<WorkPackageTypeEntityModel, DtoWorkPackageType>
  implements IWorkPackageTypeEntityAdapter {

  // <editor-fold desc='Private properties'>
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoWorkPackageType {
    return new WorkPackageType();
  }
  // </editor-fold>

  // <editor-fold desc='IWorkPackageEntityAdapter interface methods'>
  public async resourceToDto(entityModel: WorkPackageTypeEntityModel): Promise<DtoWorkPackageType> {
    const result = await super.resourceToDto(entityModel);
    result.name = entityModel.name;
    result.color = entityModel.color;
    result.position = entityModel.position;
    result.isDefault = entityModel.isDefault;
    result.isMilestone = entityModel.isMilestone;
    return result;
  }
  // </editor-fold>
}
