import { injectable } from 'inversify';
import 'reflect-metadata';
import { ProjectEntityModel, ProjectCollectionModel } from '@core/hal-models';
import { DtoProjectList, DtoProject } from '@ipc';
import { IProjectEntityAdapter } from '../entities/project-entity.adapter';
import { IBaseCollectionAdapter, BaseCollectionAdapter } from '../base-collection.adapter';
import { BaseList } from '../base-list';

// <editor-fold desc='Helper class'>
class ProjectList extends BaseList<DtoProject> implements DtoProjectList { }
// </editor-fold>

export interface IProjectCollectionAdapter extends IBaseCollectionAdapter<ProjectEntityModel, DtoProjectList, DtoProject>{ }

@injectable()
export class ProjectCollectionAdapter
  extends BaseCollectionAdapter<ProjectEntityModel, DtoProjectList, DtoProject>
  implements IProjectCollectionAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementation'>
  public createDtoList(): DtoProjectList {
    return new ProjectList();
  }
  // </editor-fold>

  // <editor-fold desc='IProjectListAdapter interface methods'>
  public resourceToDto(entityAdapter: IProjectEntityAdapter, collection: ProjectCollectionModel): Promise<DtoProjectList> {
    return super.resourceToDto(entityAdapter, collection);
  }
  // </editor-fold>
}
