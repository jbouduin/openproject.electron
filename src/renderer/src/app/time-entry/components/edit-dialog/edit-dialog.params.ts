import { DtoProject, DtoTimeEntryForm } from '@common';

export interface EditDialogParams {
  isCreate: boolean;
  timeEntry: DtoTimeEntryForm;
  projects: Array<DtoProject>;
  save: (form: DtoTimeEntryForm) => boolean;
  validate: (form: DtoTimeEntryForm) => Promise<DtoTimeEntryForm>;
}
