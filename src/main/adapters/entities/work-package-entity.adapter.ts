import { injectable } from 'inversify';
import 'reflect-metadata';
import { WorkPackageEntityModel } from '@core/hal-models';
import { DtoWorkPackage, DtoFormattableText } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { Base } from '../base';

// <editor-fold desc='Helper class'>
class WorkPackage extends Base implements DtoWorkPackage {
  public lockVersion: number;
  public subject: string;
  public description: DtoFormattableText;
  public startDate: Date;
  public dueDate: Date;

  public constructor() {
    super();
  }
}
// </editor-fold>

export interface IWorkPackageEntityAdapter extends IBaseEntityAdapter<WorkPackageEntityModel, DtoWorkPackage> { }

@injectable()
export class WorkPackageEntityAdapter
  extends BaseEntityAdapter<WorkPackageEntityModel, DtoWorkPackage>
  implements IWorkPackageEntityAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoWorkPackage {
    return new WorkPackage();
  }
  // </editor-fold>

  // <editor-fold desc='IWorkPackageEntityAdapter interface methods'>
  public async resourceToDto(entityModel: WorkPackageEntityModel): Promise<DtoWorkPackage> {
    const result = await super.resourceToDto(entityModel);
    result.lockVersion = entityModel.lockVersion;
    result.subject = entityModel.subject;
    result.description = this.resourceToFormattable(entityModel.description);
    result.startDate = entityModel.startDate;
    result.dueDate = entityModel.dueDate;
    return result;
  }
  // </editor-fold>
}
