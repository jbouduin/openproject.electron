import { DtoProject, DtoTimeEntryForm } from '@common';

export type EditDialogMode = 'create' | 'edit' | 'copy';
export interface EditDialogParams {
  mode: EditDialogMode;
  timeEntry: DtoTimeEntryForm;
  projects: Array<DtoProject>;
  save: (form: DtoTimeEntryForm) => boolean;
  validate: (form: DtoTimeEntryForm) => Promise<DtoTimeEntryForm>;
}
