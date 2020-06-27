import { DtoBaseForm } from '../dto-base-form';
import { DtoTimeEntryActivity } from './dto-time-entry-activity';
import { DtoTimeEntry } from './dto-time-entry';

export interface DtoTimeEntryForm extends DtoBaseForm<DtoTimeEntry> {
  allowedActivities: Array<DtoTimeEntryActivity>;
}
