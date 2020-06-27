import { injectable } from 'inversify';
import 'reflect-metadata';
import { TimeEntryActivityEntityModel } from '@core/hal-models';
import { DtoTimeEntryActivity } from '@ipc';
import { IBaseEntityAdapter, BaseEntityAdapter } from '../base-entity.adapter';
import { Base } from '../base';

// <editor-fold desc='Helper class'>

class TimeEntryActivity extends Base implements DtoTimeEntryActivity {

  public name: string;
  public position: number;
  public default: boolean;
  public href?: string;

  public constructor() {
    super();
  }
}
// </editor-fold>

export interface ITimeEntryActivityEntityAdapter
  extends IBaseEntityAdapter<TimeEntryActivityEntityModel, DtoTimeEntryActivity> { }

@injectable()
export class TimeEntryActivityEntityAdapter
  extends BaseEntityAdapter<TimeEntryActivityEntityModel, DtoTimeEntryActivity>
  implements ITimeEntryActivityEntityAdapter {

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    super();
  }
  // </editor-fold>

  // <editor-fold desc='Abstract methods implementation'>
  public createDto(): DtoTimeEntryActivity {
    return new TimeEntryActivity();
  }
  // </editor-fold>

  // <editor-fold desc='ITimeEntryAdapter interface methods'>
  public async resourceToDto(entityModel: TimeEntryActivityEntityModel): Promise<DtoTimeEntryActivity> {
    const result = await super.resourceToDto(entityModel);

    result.id = entityModel.id;
    result.name = entityModel.name;
    result.position = entityModel.position;
    result.default = entityModel.default;
    return result;
  }
  // </editor-fold>
}
