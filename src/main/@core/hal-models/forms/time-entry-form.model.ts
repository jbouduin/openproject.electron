import { FormModel } from './form.model';
import { TimeEntryEntityModel } from '../entities/time-entry-entity.model';
import { HalProperty } from '@jbouduin/hal-rest-client';

export class TimeEntryFormModel extends FormModel<TimeEntryEntityModel>{
  @HalProperty()
  public payload: TimeEntryEntityModel;
}
