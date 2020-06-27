import { DtoProject, DtoTimeEntryForm } from '@ipc';

export interface EditDialogParams {
  id: number;
  timeEntry: DtoTimeEntryForm;
  projects: Array<DtoProject>;
}
