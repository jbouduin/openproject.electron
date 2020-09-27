import { injectable } from 'inversify';
import 'reflect-metadata';
import { ProjectEntityModel } from '@core/hal-models';
import { DtoFormattableText, DtoCategoryList, DtoProject } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { Base } from '../base';

// <editor-fold desc='Helper class'>
class Project extends Base implements DtoProject {
  public categories!: DtoCategoryList;
  public description!: DtoFormattableText;
  public identifier!: string;
  public name!: string;
  public parentId!: number;
  public customField7!: string;
  public customField8!: string;

  public constructor() {
    super();
  }
}
// </editor-fold>

export interface IProjectEntityAdapter extends IBaseEntityAdapter<ProjectEntityModel, DtoProject> { }

@injectable()
export class ProjectEntityAdapter extends BaseEntityAdapter<ProjectEntityModel, DtoProject> implements IProjectEntityAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoProject {
    return new Project();
  }
  // </editor-fold>

  // <editor-fold desc='IProjectAdapter interface methods'>
  public async resourceToDto(entityModel: ProjectEntityModel): Promise<DtoProject> {
    const result = await super.resourceToDto(entityModel);
    result.identifier = entityModel.identifier;
    result.description = this.resourceToFormattable(entityModel.description);
    result.name = entityModel.name;
    result.customField7 = entityModel.customField7;
    result.customField8 = entityModel.customField8;

    if (entityModel.parent.isLoaded) {
      result.parentId = entityModel.parent.id;
    } else {
      result.parentId = undefined;
    }
    return result;
  }
  // </editor-fold>
}
