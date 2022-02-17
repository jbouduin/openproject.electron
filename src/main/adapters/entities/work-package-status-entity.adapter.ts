import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { WorkPackageStatusEntityModel } from '@core/hal-models';
import { DtoWorkPackageStatus } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { Base } from '../base';
import { ILogService } from '@core';
import SERVICETYPES from '@core/service.types';

//#region Helper class --------------------------------------------------------
class WorkPackageStatus extends Base implements DtoWorkPackageStatus {
  public name: string;
  public isClosed: boolean;
  public color: string;
  public isDefault: boolean;
  public isReadonly: boolean;
  public defaultDoneRatio: number;
  public position: number;

  public constructor() {
    super();
  }
}
//#endregion

export interface IWorkPackageStatusEntityAdapter extends IBaseEntityAdapter<WorkPackageStatusEntityModel, DtoWorkPackageStatus> {
  resourceToDtoSync(entityModel: WorkPackageStatusEntityModel): DtoWorkPackageStatus
}

@injectable()
export class WorkPackageStatusEntityAdapter
  extends BaseEntityAdapter<WorkPackageStatusEntityModel, DtoWorkPackageStatus>
  implements IWorkPackageStatusEntityAdapter {

  //#region Constructor & C° --------------------------------------------------
  public constructor(@inject(SERVICETYPES.LogService) logService: ILogService) {
    super(logService);
  }
  //#endregion

  //#region Abstract methods implementation -----------------------------------
  public createDto(): DtoWorkPackageStatus {
    return new WorkPackageStatus();
  }
  //#endregion

  //#region BaseEntityAdapter interface methods -------------------------------
  public async resourceToDto(entityModel: WorkPackageStatusEntityModel): Promise<DtoWorkPackageStatus> {
    return Promise.resolve(this.resourceToDtoSync(entityModel));
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public resourceToDtoSync(entityModel: WorkPackageStatusEntityModel): DtoWorkPackageStatus {
    const result = super.resourceToDtoSync(entityModel);

    result.name = entityModel.name;
    result.isClosed = entityModel.isClosed;
    result.color = entityModel.color;
    result.isDefault = entityModel.isDefault;
    result.isReadonly = entityModel.isReadonly;
    result.defaultDoneRatio = entityModel.defaultDoneRatio;
    result.position = entityModel.position;
    return result;
  }
  //#endregion
}
