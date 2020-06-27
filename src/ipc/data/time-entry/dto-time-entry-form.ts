// import { DtoWorkPackage } from '../work-package/dto-work-package';
import { DtoBaseForm } from '../dto-base-form';
import { DtoTimeEntryActivity } from './dto-time-entry-activity';
import { DtoTimeEntry } from './dto-time-entry';

export interface DtoTimeEntryForm extends DtoBaseForm<DtoTimeEntry> {
  allowedActivities: Array<DtoTimeEntryActivity>;
  // allowedWorkPackages: Array<DtoWorkPackage>;
}
