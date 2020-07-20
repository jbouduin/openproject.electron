import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { WorkPackageEntityModel } from '@core/hal-models';
import { DtoWorkPackage, DtoFormattableText, DtoProject } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { IProjectEntityAdapter } from './project-entity.adapter';
import { Base } from '../base';

import ADAPTERTYPES from '@adapters/adapter.types';

// <editor-fold desc='Helper class'>
class WorkPackage extends Base implements DtoWorkPackage {
  public lockVersion: number;
  public subject: string;
  public description: DtoFormattableText;
  public startDate: Date;
  public dueDate: Date;
  public project: DtoProject;

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

  // <editor-fold desc='Private properties'>
  private projectEntityAdapter: IProjectEntityAdapter;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    @inject(ADAPTERTYPES.ProjectEntityAdapter) projectEntityAdapter: IProjectEntityAdapter) {
    super();
    this.projectEntityAdapter = projectEntityAdapter;
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
    if (entityModel.project) {
      if (!entityModel.project.isLoaded) {
        console.log('apparently not prefetched');
        await entityModel.project.fetch();
      }
      if (entityModel.project.isLoaded) {
        result.project = await this.projectEntityAdapter.resourceToDto(entityModel.project);
      }
    }
    return result;
  }
  // </editor-fold>
}
