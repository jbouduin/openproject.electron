import { injectable, inject } from 'inversify';
import 'reflect-metadata';
import { TimeEntryEntityModel, TimeEntryFormModel, SchemaModel } from '@core/hal-models';
import { DtoBaseForm, DtoTimeEntry, DtoTimeEntryForm, DtoTimeEntryActivity, DtoValidationError } from '@ipc';
import ADAPTERTYPES from '../adapter.types';
import { ITimeEntryActivityEntityAdapter } from '../entities/time-entry-activity-entity.adapter';
import { TimeEntryEntityAdapter } from '../entities/time-entry-entity.adapter';
import { BaseFormAdapter, IBaseFormAdapter } from '../base-form.adapter';
import SERVICETYPES from '@core/service.types';
import { ILogService } from '@core';

export type ITimeEntryFormAdapter =
  IBaseFormAdapter<TimeEntryEntityModel, DtoBaseForm<DtoTimeEntry>, DtoTimeEntry>;

// <editor-fold desc='Helper class'>
class TimeEntryForm implements DtoTimeEntryForm {
  commit: string;
  commitMethod: string;
  self: string;
  validate: string;
  payload: DtoTimeEntry;
  allowedActivities: Array<DtoTimeEntryActivity>;
  validationErrors: Array<DtoValidationError>;
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
  public constructor(
    @inject(SERVICETYPES.LogService) logService: ILogService,
    @inject(ADAPTERTYPES.TimeEntryActivityEntityAdapter) activityAdapter: ITimeEntryActivityEntityAdapter) {
    super(logService);
    this.activityAdapter = activityAdapter;
  }
  // </editor-fold>

  // <editor-fold desc='Abstract method implementations'>
  protected createFormDto(): DtoTimeEntryForm {
    return new TimeEntryForm();
  }

  protected async processSchema(schema: SchemaModel, form: DtoTimeEntryForm): Promise<DtoTimeEntryForm> {
    form.allowedActivities = await Promise.all(
      schema.activity.allowedValues.map(activity => this.activityAdapter.resourceToDto(activity))
    );
    return form;
  }
  // </editor-fold>

  // <editor-fold desc='IBaseFormAdapter interface methods'>
  public async resourceToDto(
    entityAdapter: TimeEntryEntityAdapter,
    form: TimeEntryFormModel): Promise<DtoTimeEntryForm> {
    return await super.resourceToDto(entityAdapter, form);
  }
  // </editor-fold>
}
