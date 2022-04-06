import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { Pricing } from '@common';
import { ProjectEntityModel } from '@core/hal-models';
import { DtoFormattableText, DtoProject } from '@common';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { Base } from '../base';
import { ILogService } from '@core';
import SERVICETYPES from '@core/service.types';

//#region  Helper class -------------------------------------------------------
class Project extends Base implements DtoProject {

  public active: boolean;
  public description!: DtoFormattableText;
  public identifier!: string;
  public name: string;
  public parentId!: number;
  // customfields
  public timesheetApprovalName?: string;
  public timesheetApprovalLocation?: string;
  public pricing: Pricing;
  public customer?: string;
  public endCustomer?: string;
  public startDate?: Date;
  public endDate?: Date;

  public constructor() {
    super();
  }
}
//#endregion

export interface IProjectEntityAdapter extends IBaseEntityAdapter<ProjectEntityModel, DtoProject> {
  resourceToDtoSync(entityModel: ProjectEntityModel): DtoProject
}

@injectable()
export class ProjectEntityAdapter extends BaseEntityAdapter<ProjectEntityModel, DtoProject> implements IProjectEntityAdapter {

  //#region Constructor & C°
  public constructor(@inject(SERVICETYPES.LogService) logService: ILogService) {
    super(logService);
  }
  //#endregion

  //#region Abstract methods implementation -----------------------------------
  public createDto(): DtoProject {
    return new Project();
  }
  //#endregion

  //#region  IProjectAdapter interface methods --------------------------------
  public async resourceToDto(entityModel: ProjectEntityModel): Promise<DtoProject> {
    return Promise.resolve(this.resourceToDtoSync(entityModel));
  }

  public resourceToDtoSync(entityModel: ProjectEntityModel): DtoProject {
    const result = super.resourceToDtoSync(entityModel);
    result.active = entityModel.active;
    result.identifier = entityModel.identifier;
    result.description = this.resourceToFormattable(entityModel.description);
    result.name = entityModel.name;
    // custom fields
    result.timesheetApprovalName = entityModel.timesheetApprovalName;
    result.timesheetApprovalLocation = entityModel.timesheetApprovalLocation;
    result.pricing = entityModel.pricing ? entityModel.pricing.getProperty('title') : 'None';
    result.customer = entityModel.customer;
    result.endCustomer = entityModel.endCustomer;
    result.startDate = entityModel.startDate ? new Date(entityModel.startDate) : undefined;
    result.endDate = entityModel.endDate ? new Date(entityModel.endDate) : undefined;
    if (entityModel.parent.isLoaded) {
      result.parentId = entityModel.parent.id;
    } else {
      result.parentId = undefined;
    }
    return result;
  }
  //#endregion
}
