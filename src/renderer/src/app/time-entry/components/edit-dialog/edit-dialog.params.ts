import { DtoProject, DtoTimeEntryForm } from '@ipc';

export interface EditDialogParams {
  timeEntry: DtoTimeEntryForm;
  projects: Array<DtoProject>;
}
