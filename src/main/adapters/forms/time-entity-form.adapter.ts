import { HalResource } from 'hal-rest-client';
import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { TimeEntryEntityModel, TimeEntryFormModel, SchemaModel } from '@core/hal-models';
import { DtoBaseForm, DtoTimeEntry, DtoTimeEntryForm, DtoTimeEntryActivity } from '@ipc';
import ADAPTERTYPES from '../adapter.types';
import { ITimeEntryActivityEntityAdapter } from '../entities/time-entry-activity-entity.adapter';
import { TimeEntryEntityAdapter } from '../entities/time-entry-entity.adapter';
import { BaseFormAdapter, IBaseFormAdapter } from '../base-form.adapter';

export interface ITimeEntryFormAdapter
  extends IBaseFormAdapter<TimeEntryEntityModel, DtoBaseForm<DtoTimeEntry>, DtoTimeEntry> { }

// <editor-fold desc='Helper class'>
class TimeEntryForm implements DtoTimeEntryForm {
  payload: DtoTimeEntry;
  allowedActivities: Array<DtoTimeEntryActivity>;
}
// </editor-fold>

@injectable()
export class TimeEntryFormAdapter
  extends BaseFormAdapter<TimeEntryEntityModel, DtoTimeEntryForm, DtoTimeEntry>
  implements ITimeEntryFormAdapter {

  // <editor-fold desc='Private properties'>
  private activityAdapter: ITimeEntryActivityEntityAdapter;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(@inject(ADAPTERTYPES.TimeEntryActivityEntityAdapter) activityAdapter: ITimeEntryActivityEntityAdapter) {
    super();
    this.activityAdapter = activityAdapter;
  }
  // </editor-fold>

  protected createFormDto(): DtoTimeEntryForm {
    return new TimeEntryForm();
  }

  protected async processSchema(schema: SchemaModel, form: DtoTimeEntryForm): Promise<void> {
    form.allowedActivities = await Promise.all(
      schema.activity.allowedValues.map(activity => this.activityAdapter.resourceToDto(activity))
    );
  }

  protected processValidationErrors(errors: HalResource, form: DtoTimeEntryForm): Promise<void> {
    if (errors.props) {
      console.log('error props', errors.props);
    }
    return;
  }

  public async resourceToDto(
    entityAdapter: TimeEntryEntityAdapter,
    form: TimeEntryFormModel): Promise<DtoTimeEntryForm> {
    return await super.resourceToDto(entityAdapter, form);
  }
}
